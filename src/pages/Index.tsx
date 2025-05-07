
import { Separator } from "@/components/ui/separator";
import AudioAnalyzer from "@/components/AudioAnalyzer";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00ffcc] to-[#0088ff]">
              Spectral Sound Canvas
            </h1>
            <p className="text-sm text-gray-400">Real-time audio frequency visualization</p>
          </div>
          <div className="flex items-center">
            <a 
              href="https://github.com/lovable-dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-[#151515] p-6 rounded-lg border border-gray-800 shadow-lg">
            <AudioAnalyzer />
          </div>
          
          <div className="bg-[#151515] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-medium mb-4">About Spectral Sound Canvas</h2>
            <p className="text-gray-300">
              This real-time audio spectrum analyzer visualizes the frequency content of your audio input.
              Select an audio device, choose your preferred visualization style, and explore the 
              spectral characteristics of different sounds.
            </p>
            
            <Separator className="my-6 bg-gray-800" />
            
            <h3 className="text-lg font-medium mb-3">Technical Details</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Uses the Web Audio API for real-time audio processing</li>
              <li>Analyzes frequencies using Fast Fourier Transform (FFT)</li>
              <li>Visualizes frequencies from 20Hz to 20kHz (human hearing range)</li>
              <li>Renders on HTML canvas with optimized performance</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>© 2025 Spectral Sound Canvas. Built with the Web Audio API.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
