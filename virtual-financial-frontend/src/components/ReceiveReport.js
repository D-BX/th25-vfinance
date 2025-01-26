import React, { useState } from 'react';
import axios from 'axios';

const ReceiveReport = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState('');

  const handleSendReport = async () => {
    setLoading(true);
    setError('');
    setShowPopup(false);

    // Report content (replace with dynamic data if needed)
    const reportContent = `
    Financial Insights Report
    -------------------------
    Expense Breakdown:
    - Housing: $500
    - Food: $300
    - Transport: $200
    - Entertainment: $100

    ChatGPT Conversation:
    "How can I save money?" -> "Reduce entertainment expenses and dining out."
    `;

    try {
      const response = await axios.post('http://localhost:5001/send-report', {
        email, // Recipient's email
        reportContent, // Financial report content
      });

      if (response.status === 200) {
        setShowPopup(true); // Show success popup
      } else {
        setError('Failed to send the report. Please try again.');
      }
    } catch (error) {
      setError('Failed to send the report. Please try again.');
      console.error('Error sending report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receive-report">
      <div className="content">
        <h1>Receive Your Financial Report</h1>
        <div className="divider" />
        <p>
          Enter your email below to receive a detailed financial report, including your expense breakdown, insights, and
          recommendations from ChatGPT.
        </p>

        <div className="form-section">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            onClick={handleSendReport}
            disabled={loading || !email}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Sending...' : 'Send Report'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="divider" />

        <p className="footer-note">
          We value your privacy. Your email will only be used for delivering this report.
        </p>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Success!</h2>
            <p>Your report has been sent successfully to {email}.</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveReport;
