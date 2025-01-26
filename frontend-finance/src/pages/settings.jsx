import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "../components/Experience";
import { UI } from "../components/UI";
import { Leva } from "leva";
import { useChat } from "../hooks/useChat";


const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";


const SpendingWrapped = () => {
  const { chat } = useChat();
  const [file, setFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (analysisData && currentSlide === 0) {
      chat(`I see you've spent $${analysisData.totalSpent} in total. Let me analyze this for you.`);
    } else if (analysisData && currentSlide === 1) {
      chat(`Your highest spending category is ${analysisData.topCategory} at $${analysisData.topCategoryAmount}. Would you like some tips on reducing expenses in this category?`);
    } else if (analysisData && currentSlide === 2) {
      chat(`I notice your biggest purchase was ${analysisData.biggestPurchase.merchant} for $${analysisData.biggestPurchase.amount}. Let's discuss if this aligns with your financial goals.`);
    }
  }, [analysisData, currentSlide]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('pdf', file);
  
      try {
        const response = await fetch(`${backendUrl}/analyze-statement`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Analysis data:', data);
        
        if (!data.totalSpent || !data.topCategory || !data.biggestPurchase) {
          throw new Error('Invalid data format received');
        }
        
        setAnalysisData(data);
        chat("I'm analyzing your statement now. Let me walk you through your spending patterns.");
      } catch (error) {
        console.error('Error analyzing statement:', error);
        chat("I encountered an error analyzing your statement. Could you try uploading it again?");
      }
    }
  };

  const slides = analysisData ? [
    {
      title: "Total Spent 💸",
      content: <div className="text-4xl font-bold">${analysisData.totalSpent}</div>
    },
    {
      title: "Top Category 🏆",
      content: <div className="space-y-2">
        <div className="text-2xl">{analysisData.topCategory}</div>
        <div className="text-xl">${analysisData.topCategoryAmount}</div>
      </div>
    },
    {
      title: "Biggest Purchase 🎯",
      content: <div className="space-y-2">
        <div className="text-xl">{analysisData.biggestPurchase.merchant}</div>
        <div className="text-2xl">${analysisData.biggestPurchase.amount}</div>
      </div>
    },
    // Add more slides as needed
  ] : [];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          <div className="w-2/3">
            {!analysisData ? (
              <div className="bg-gradient-to-br from-blue-600/20 to-white/10 backdrop-blur-sm rounded-2xl p-12 shadow-xl text-center">
                <h2 className="text-3xl font-bold text-white mb-8">Your Spending Wrapped 2025</h2>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="statementUpload"
                />
                <label
                  htmlFor="statementUpload"
                  className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-lg"
                >
                  Upload Statement
                </label>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-600/20 to-white/10 backdrop-blur-sm rounded-2xl p-12 shadow-xl min-h-[600px] flex flex-col items-center justify-center text-white text-center">
                {slides[currentSlide] && (
                  <div className="space-y-8 animate-fadeIn">
                    <h3 className="text-3xl font-bold mb-4">{slides[currentSlide].title}</h3>
                    {slides[currentSlide].content}
                  </div>
                )}
                <div className="mt-12 flex gap-4">
                  <button
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                    className="px-6 py-2 bg-white/10 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                    disabled={currentSlide === slides.length - 1}
                    className="px-6 py-2 bg-white/10 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-1/3 sticky top-8">
            <div className="h-[600px] relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-white/50">
              <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
                <Experience />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
      <Leva hidden />
      <UI />
    </div>
  );
};

export default SpendingWrapped;