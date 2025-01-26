import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const Insights = () => {
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [userQuery, setUserQuery] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const pieData = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment'],
    datasets: [
      {
        data: [500, 300, 200, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
        hoverOffset: 10,
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: [400, 500, 450, 600, 550],
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.1,
      },
    ],
  };

  // Function to fetch solution from OpenAI
  const fetchSolutionFromOpenAI = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          model: 'text-davinci-003', // Use your preferred model
          prompt: `Provide financial advice based on the following query: ${userQuery}`,
          max_tokens: 150, // Limit the response length
          temperature: 0.7, // Control randomness
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: ``, // Replace with your OpenAI API key
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
    <div className="insights-page">
      {/* Left Section: Data Table */}
      <div className="left-section">
        <h3>Expense Breakdown</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Housing</td>
              <td>$500</td>
            </tr>
            <tr>
              <td>Food</td>
              <td>$300</td>
            </tr>
            <tr>
              <td>Transport</td>
              <td>$200</td>
            </tr>
            <tr>
              <td>Entertainment</td>
              <td>$100</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Right Section: Charts */}
      <div className="right-section">
        <div className="pie-chart">
          <h3>Spending Distribution</h3>
          <Pie data={pieData} ref={pieChartRef} />
        </div>
        <div className="line-graph">
          <h3>Monthly Spending Trend</h3>
          <Line data={lineData} ref={lineChartRef} />
        </div>
      </div>

      {/* Bottom Section: Solution Box */}
      <div className="solution-box">
        <h3>Get Insights on Your Financial Problem</h3>
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Ask about saving money, budgeting, etc."
        />
        <button onClick={fetchSolutionFromOpenAI} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
        {solution && (
          <div className="solution-output">
            <p><strong>Solution:</strong> {solution}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
