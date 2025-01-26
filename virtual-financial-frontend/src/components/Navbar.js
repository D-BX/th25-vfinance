import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Virtual Finance</h1>
      <div>
        <Link to="/">Home</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/receive-report">Receive Report</Link>
      </div>
    </nav>
  );
};

export default Navbar;
