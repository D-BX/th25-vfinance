import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      alert(`Uploaded: ${file.name}`);
      // Handle actual file upload logic here
    }
  };

  return (
    <div className="file-upload">
      <h3>Upload Financial Data</h3>
      <label htmlFor="file-input">Choose File</label>
      <input
        type="file"
        id="file-input"
        onChange={handleFileChange}
        accept=".csv"
      />
      {file && <p>Selected File: {file.name}</p>}
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
