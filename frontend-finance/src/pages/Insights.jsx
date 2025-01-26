import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { Canvas } from "@react-three/fiber";
import { Experience } from "../components/Experience";
import { UI } from "../components/UI";
import { Leva } from "leva";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Insights = () => {
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [userQuery, setUserQuery] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const pieData = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment'],
    datasets: [{
      data: [500, 300, 200, 100],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
      hoverOffset: 10,
    }],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Monthly Expenses',
      data: [400, 500, 450, 600, 550],
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
                        <td className="p-2 border-b border-white/10">Housing</td>
                        <td className="p-2 text-right border-b border-white/10">$500</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-white/10">Food</td>
                        <td className="p-2 text-right border-b border-white/10">$300</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-white/10">Transport</td>
                        <td className="p-2 text-right border-b border-white/10">$200</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-white/10">Entertainment</td>
                        <td className="p-2 text-right border-b border-white/10">$100</td>
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