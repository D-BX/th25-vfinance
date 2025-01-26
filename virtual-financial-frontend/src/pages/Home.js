import React from 'react';
import Chatbot from '../components/Chatbot';
import FileUpload from '../components/FileUpload';

const Home = () => {
  return (
    <div className="home">
      <Chatbot />
      <FileUpload />
    </div>
  );
};

export default Home;
