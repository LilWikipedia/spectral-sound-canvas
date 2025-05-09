import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import AudioAnalyzer from "@/components/AudioAnalyzer";

const NotFound = () => {
  // const location = useLocation();

  // useEffect(() => {
  //   console.error(
  //     "404 Error: User attempted to access non-existent route:",
  //     location.pathname
  //   );
  // }, [location.pathname]);

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //     <div className="text-center">
  //       <h1 className="text-4xl font-bold mb-4">404</h1>
  //       <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
  //       <a href="/" className="text-blue-500 hover:text-blue-700 underline">
  //         Return to Home
  //       </a>
  //     </div>
  //   </div>



  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00ffcc] to-[#0088ff]">
              Joe's million dollar idea
            </h1>
            <p className="text-sm text-gray-400">Real-time analyzation</p>
          </div>
          <div className="flex items-center">
            <a>
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
              This real-time audio spectrum analyzer that seperates the gutz from the screen with hdmi coming soon!
            </p>
            
            <Separator className="my-6 bg-gray-800" />
            
            
            
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p></p>
        </div>
      </footer>
    </div>





  );
}

export default NotFound;
