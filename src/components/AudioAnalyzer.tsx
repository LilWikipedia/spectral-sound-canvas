
import React, { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { AudioWaveform, ChartBar, ChartLine } from "lucide-react";
import { toast } from "sonner";

type VisualizationType = "bar" | "line";

const AudioAnalyzer: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [visualizationType, setVisualizationType] = useState<VisualizationType>("bar");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize and fetch audio devices
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === "audioinput");
        setAudioDevices(audioInputs);
        
        if (audioInputs.length > 0) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Could not access audio devices. Please check your permissions.");
      }
    };

    getAudioDevices();

    return () => {
      if (audioContextRef.current) {
        stopAnalyzer();
      }
    };
  }, []);

  // Start the audio analyzer
  const startAnalyzer = async () => {
    try {
      if (!selectedDeviceId) {
        toast.error("Please select an audio input device.");
        return;
      }

      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Get audio stream from selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: selectedDeviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      streamRef.current = stream;

      // Create analyzer node
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      // Connect source to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Start visualization
      setIsAnalyzing(true);
      visualize();
      toast.success("Audio analysis started");
    } catch (error) {
      console.error("Error starting analyzer:", error);
      toast.error("Failed to start audio analyzer. Please check your permissions.");
    }
  };

  // Stop the audio analyzer
  const stopAnalyzer = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.suspend();
    }

    analyserRef.current = null;
    setIsAnalyzing(false);
    toast.info("Audio analysis stopped");
  };

  // Toggle analyzer on/off
  const toggleAnalyzer = () => {
    if (isAnalyzing) {
      stopAnalyzer();
    } else {
      startAnalyzer();
    }
  };

  // Draw the visualization
  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth;
    const height = canvas.height = canvas.clientHeight;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;

      // Get the frequency data
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Clear canvas
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid lines
      drawGrid(ctx, width, height);

      // Choose visualization type
      if (visualizationType === "bar") {
        drawBars(ctx, width, height, dataArray, bufferLength);
      } else {
        drawLine(ctx, width, height, dataArray, bufferLength);
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  // Draw grid on canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 0.5;
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666666';
    
    // Horizontal lines
    const horizontalLines = 5;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = height - (i * height / horizontalLines);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      const dbValue = i * 20; // Simple dB scale (not actual dB)
      ctx.fillText(`${dbValue}dB`, 5, y - 5);
    }
    
    // Vertical lines (frequency)
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    const logMax = Math.log10(20000);
    const logMin = Math.log10(20);
    
    frequencies.forEach(freq => {
      const logFreq = Math.log10(freq);
      const x = (logFreq - logMin) / (logMax - logMin) * width;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      let label = freq >= 1000 ? `${freq/1000}k` : `${freq}`;
      ctx.fillText(label, x - 10, height - 5);
    });
  };

  // Draw bars visualization
  const drawBars = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dataArray: Uint8Array, 
    bufferLength: number
  ) => {
    const barWidth = width / bufferLength * 2.5;
    let x = 0;
    
    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, "#00ffcc");
    gradient.addColorStop(0.5, "#00aaff");
    gradient.addColorStop(1, "#0066ff");
    
    // Draw each bar
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
      if (x >= width) break;
    }
  };

  // Draw line visualization
  const drawLine = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dataArray: Uint8Array, 
    bufferLength: number
  ) => {
    // Create gradient for line
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#00ffcc");
    gradient.addColorStop(0.5, "#00aaff");
    gradient.addColorStop(1, "#0066ff");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 255;
      const y = height - (v * height);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
      if (x >= width) break;
    }
    
    ctx.stroke();
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00ffcc] to-[#0088ff]">
          Spectrum Analyzer
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="device-select" className="text-sm font-medium mb-2 block text-gray-300">
            Audio Input
          </label>
          <Select 
            value={selectedDeviceId}
            onValueChange={value => setSelectedDeviceId(value)}
            disabled={isAnalyzing}
          >
            <SelectTrigger className="w-full bg-secondary border-gray-700">
              <SelectValue placeholder="Select audio device" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-gray-700">
              {audioDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}
                  className="hover:bg-secondary/90">
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">Visualization:</span>
          <div className="flex border border-gray-700 rounded-md">
            <Toggle
              pressed={visualizationType === "bar"}
              onPressedChange={() => setVisualizationType("bar")}
              className={`rounded-l-md rounded-r-none px-3 ${
                visualizationType === "bar" ? "bg-accent" : "bg-secondary"
              }`}
              aria-label="Bar chart"
            >
              <ChartBar className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={visualizationType === "line"}
              onPressedChange={() => setVisualizationType("line")}
              className={`rounded-r-md rounded-l-none px-3 ${
                visualizationType === "line" ? "bg-accent" : "bg-secondary"
              }`}
              aria-label="Line chart"
            >
              <ChartLine className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        
        <div className="mt-2 sm:mt-0">
          <Button 
            onClick={toggleAnalyzer}
            className={`${
              isAnalyzing 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
          >
            <AudioWaveform className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Stop" : "Start"} Analysis
          </Button>
        </div>
      </div>
      
      <div className="relative border border-gray-700 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="analyzer-canvas"
        />
        {!isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-gray-300">
              {selectedDeviceId 
                ? "Click Start Analysis to begin" 
                : "Please select an audio input device"}
            </p>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-400">
        <p>Tips:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Play music or speak into your microphone to see the visualization</li>
          <li>Try different visualization types to see frequency patterns</li>
          <li>For best results, use an external microphone or audio interface</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioAnalyzer;
