import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Cashlyn Logo */}
      <div className="absolute top-0 left-0 p-4 z-20">
        <h2
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white text-transparent bg-clip-text tracking-wide neon-effect"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            textShadow: "0 0 3px #ffffff, 0 0 6px #ffffff, 0 0 10px #007aff, 0 0 100px #007aff",
          }}
        >
          Cashlyn
        </h2>
      </div>
      <h1 className="text-center font-semibold text-xl mt-6">Virtual Finance</h1>
      <div className="nav-links">
        <Link to="/" className="nav-button">
          Home
        </Link>
        <Link to="/insights" className="nav-button">
          Insights
        </Link>
        <Link to="/settings" className="nav-button">
          Spending Wrapped
        </Link>
        <Link to="/receive-report" className="nav-button">
          Receive Report
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
