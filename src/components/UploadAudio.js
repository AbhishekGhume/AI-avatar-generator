import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: (isDark) => ({
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0',
    color: isDark ? 'white' : 'black',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
  }),
  backButton: (isDark) => ({
    position: 'absolute',
    left: '20px',
    top: '20px',
    padding: '8px 16px',
    backgroundColor: isDark ? '#444' : '#6c757d',
    color: 'white',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
  }),
  fileInput: {
    margin: '20px 0',
    padding: '10px',
    fontSize: '16px',
  },
  button: (isDark, disabled) => ({
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#999' : isDark ? '#007bff' : '#007bff',
    color: 'white',
    opacity: disabled ? 0.7 : 1,
  }),
  videoContainer: {
    width: '100%',
    maxWidth: '800px',
    height: 'auto',
    aspectRatio: '16/9',
    margin: '20px auto',
    backgroundColor: '#000',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  placeholderVideo: (isDark) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isDark ? '#ccc' : '#fff',
    fontSize: '18px',
  }),
};

function AudioUpload({ isDarkMode }) {
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an audio file.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://localhost:5000/generate-from-audio', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.videoUrl) {
        const fullVideoUrl = `http://localhost:5000${data.videoUrl}?t=${Date.now()}`;
        setVideoUrl(fullVideoUrl);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.container(isDarkMode)}>
      <button 
        style={styles.backButton(isDarkMode)}
        onClick={() => navigate('/')}
      >
        ← Back to Dashboard
      </button>

      <h1>Audio-to-Video Creator</h1>
      
      <input
        type="file"
        accept=".wav,.mp3,.mpeg"
        onChange={handleFileChange}
        style={styles.fileInput}
        disabled={isGenerating}
      />

      <button
        onClick={handleUpload}
        style={styles.button(isDarkMode, isGenerating)}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Video'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={styles.videoContainer}>
        {videoUrl ? (
          <video
            style={styles.video}
            src={videoUrl}
            controls
            autoPlay
            onError={() => setError('Failed to load video')}
          />
        ) : (
          <div style={styles.placeholderVideo(isDarkMode)}>
            {isGenerating ? 'Generating video...' : 'Video will appear here'}
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioUpload;