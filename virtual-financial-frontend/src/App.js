import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Settings from './pages/settings';
import ReceiveReport from './components/ReceiveReport';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/receive-report" element={<ReceiveReport />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
