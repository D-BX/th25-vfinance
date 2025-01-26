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
  const [userQuery, setUserQuery] = useState('');
  const [solution, setSolution] = useState('');
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

  const fetchSolutionFromOpenAI = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          model: 'text-davinci-003',
          prompt: `Provide financial advice based on the following query: ${userQuery}`,
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: ``, // Your OpenAI API key
          },
        }
      );
      setSolution(response.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error fetching solution from OpenAI:', error);
      setSolution('Unable to fetch a solution at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // You can craft any initial message here that references your data.
    chat(`Welcome back! Here's a quick summary of your spending insights for this month.
          Your total monthly expenses are around $4,200. Rent is your largest category at $1,074, 
          followed by Entertainment at $1,200. Let me know how I can help!`);
  }, [chat]); // runs only once at component mount

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Section: Data Table */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="text-xl font-bold text-white mb-4">Expense Breakdown</h3>
                  <table className="w-full text-white">
                    <thead>
                      <tr>
                        <th className="p-2 text-left border-b border-white/20">Category</th>
                        <th className="p-2 text-right border-b border-white/20">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-b border-white/10">Rent/Mortgage</td>
                        <td className="p-2 text-right border-b border-white/10">$1074</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-white/10">Utilities</td>
                        <td className="p-2 text-right border-b border-white/10">$227</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-white/10">Groceries</td>
                        <td className="p-2 text-right border-b border-white/10">$496</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-white/10">Entertainment</td>
                        <td className="p-2 text-right border-b border-white/10">$1200</td>
                      </tr>
                       <tr>
                        <td className="p-2 border-b border-white/10">Dining Out</td>
                        <td className="p-2 text-right border-b border-white/10">$901</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right Section: Charts */}
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="text-xl font-bold text-white mb-4">Spending Distribution</h3>
                    <Pie data={pieData} ref={pieChartRef} />
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="text-xl font-bold text-white mb-4">Monthly Spending Trend</h3>
                    <Line data={lineData} ref={lineChartRef} />
                  </div>
                </div>
              </div>

              {/* Bottom Section: Solution Box */}
              <div className="mt-6 bg-white/10 rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-4">Get Insights on Your Financial Problem</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask about saving money, budgeting, etc."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50"
                  />
                  <button
                    onClick={fetchSolutionFromOpenAI}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Submit'}
                  </button>
                </div>
                {solution && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <p className="text-white"><strong>Solution:</strong> {solution}</p>
                  </div>
                )}
              </div>
            </div>
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

export default Insights;