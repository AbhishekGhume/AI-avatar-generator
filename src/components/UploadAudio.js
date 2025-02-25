import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadAudio() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← Back to Dashboard</button>
      <h1>Upload Audio File</h1>
      {/* Add your upload audio functionality here */}
    </div>
  );
}