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
  textArea: {
    width: '80%',
    maxWidth: '600px',
    height: '150px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    margin: '20px 0',
    resize: 'none',
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px',
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

function TextScript({ isDarkMode }) {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerateVideo = async () => {
    if (!text.trim()) {
      setError('Please enter some text.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/generate-from-text', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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

      <h1>Text Script to Video</h1>
      
      <textarea
        style={styles.textArea}
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isGenerating}
      />

<div style={styles.buttonContainer}>
  <button
    onClick={handleGenerateVideo}
    style={styles.button(isDarkMode, isGenerating)}
    disabled={isGenerating}
  >
    {isGenerating ? 'Generating...' : 'Generate Video'}
  </button>
</div>


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

export default TextScript;