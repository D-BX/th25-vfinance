import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const data = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment'],
    datasets: [
      {
        data: [500, 300, 200, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>Financial Breakdown</h2>
      <Pie data={data} />
    </div>
  );
};

export default Dashboard;
