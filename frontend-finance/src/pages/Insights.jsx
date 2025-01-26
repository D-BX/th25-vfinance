import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { Canvas } from "@react-three/fiber";
import { Experience } from "../components/Experience";
import { UI } from "../components/UI";
import { Leva } from "leva";
import { useChat } from '../hooks/useChat';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Insights = () => {
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [detailedInsights, setDetailedInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const { chat } = useChat();

  const pieData = {
    labels: ["Rent/Mortgage", "Utilities", "Groceries", "Entertainment", "Dining Out"],
    datasets: [{
      data: [1074, 227, 496, 1200, 901],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF'],
      hoverOffset: 10,
    }],
  };

  const lineData = {
    labels: ['1/31/2023', '2/28/2023', '3/31/2023', '4/30/2023', '5/31/2023', '6/30/2023', '7/31/2023', '8/31/2023', '9/30/2023', '10/31/2023', '11/30/2023', '12/31/2023', '1/31/2024', '2/29/2024', '3/31/2024', '4/30/2024', '5/31/2024', '6/30/2024', '7/31/2024', '8/31/2024', '9/30/2024', '10/31/2024', '11/30/2024', '12/31/2024', '1/31/2025', '2/28/2025', '3/31/2025', '4/30/2025', '5/31/2025', '6/30/2025', '7/31/2025', '8/31/2025', '9/30/2025', '10/31/2025', '11/30/2025', '12/31/2025'],
    datasets: [{
      label: 'Monthly Expenses',
      data: [3467.0, 4263.0, 4254.0, 4851.0, 4706.0, 3198.0, 3418.0, 4003.0, 1984.0, 4807.0, 3582.0, 3634.0, 3407.0, 3209.0, 4120.0, 4681.0, 3997.0, 2046.0, 2637.0, 3455.0, 3097.0, 4819.0, 4235.0, 4491.0, 3576.0, 5592.0, 3019.0, 5406.0, 4619.0, 3403.0, 3415.0, 5118.0, 2719.0, 3779.0, 4078.0, 5239.0],
      fill: false,
      borderColor: '#36A2EB',
      tension: 0.1,
    }],
  };

  const fetchDetailedInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          model: 'text-davinci-003',
          prompt: `Analyze the user's spending data and provide detailed insights:
          - Breakdown of spending and where savings are possible.
          - Recommendations for building an emergency fund for disasters.
          - Be prompt and only talk once
          - An explanation of how the ARIMA model analyzes spending and predicts disaster potential.`,
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
          },
        }
      );
      setDetailedInsights(response.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error fetching detailed insights:', error);
      setDetailedInsights('Unable to fetch insights at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Send an initial chat message once on mount
    chat(`Welcome back! Here's a quick summary of your spending insights for this month.
      Your total monthly expenses are around $4,200. Rent is your largest category at $1,074, 
      followed by Entertainment at $1,200. Let me know how I can help!`);
  }, [chat]);

  useEffect(() => {
    return () => {
      if (pieChartRef.current) pieChartRef.current.destroy();
      if (lineChartRef.current) lineChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          <div className="w-2/3">
            <div className="bg-gradient-to-br from-blue-600/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              {/* Insights Section */}
        <div className="mt-8 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">Your Financial Insights</h3>
          <h3 className="text-xl font-bold text-white mb-4">Expense Breakdown</h3>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-4 text-left border-b border-white/20 font-medium">Category</th>
                  <th className="p-4 text-right border-b border-white/20 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 border-b border-white/10">Rent/Mortgage</td>
                  <td className="p-4 text-right border-b border-white/10">$1,074</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 border-b border-white/10">Food</td>
                  <td className="p-4 text-right border-b border-white/10">$901</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 border-b border-white/10">Utilities</td>
                  <td className="p-4 text-right border-b border-white/10">$227</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 border-b border-white/10">Entertainment</td>
                  <td className="p-4 text-right border-b border-white/10">$1200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Pie Chart */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Spending Distribution</h3>
            <div className="p-4">
              <Pie data={pieData} ref={pieChartRef} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Monthly Spending Trend</h3>
            <div className="p-4">
              <Line data={lineData} ref={lineChartRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
          {/* 3D Visualization */}
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

export default Insights;
