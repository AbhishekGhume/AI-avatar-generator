import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import avatar1 from '../avatars/avatar1.jpg';
import avatar2 from '../avatars/avatar2.jpg';
import avatar3 from '../avatars/avatar3.jpg';
import avatar4 from '../avatars/avatar4.jpg';

const styles = {
  container: (isDark) => ({
    textAlign: 'center',
    // fontFamily: 'Arial, sans-serif',
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
  textArea: (isDark) => ({
    width: '80%',
    maxWidth: '600px',
    height: '150px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginTop: '20px',
    resize: 'none',
    backgroundColor: isDark ? '#333' : '#fff',
    color: isDark ? '#fff' : '#000',
  }),
  videoContainer: {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    backgroundColor: '#000',
    borderRadius: '10px',
    overflow: 'hidden',
    minHeight: '360px',              
    display: 'flex',                 
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
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
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  button: (color, disabled) => ({
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '25px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#999' : color,
    color: 'white',
    opacity: disabled ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  avatarOptions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  avatarOption: (isSelected) => ({
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: isSelected ? '3px solid #007bff' : '3px solid transparent',
    padding: '2px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  }),
  featuresRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '40px',
    flexWrap: 'wrap',
  },
  featureCard: (isDark) => ({
    backgroundColor: isDark ? '#2d2d2d' : '#fff',
    color: isDark ? 'white' : 'black',
    padding: '15px 20px',
    borderRadius: '10px',
    width: '250px',
    textAlign: 'left',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  }),
};

function TextScript({ isDarkMode }) {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const navigate = useNavigate();
  const avatarImages = [avatar1, avatar2, avatar3, avatar4];

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
        body: JSON.stringify({ 
          text,
          avatarId: selectedAvatar
        }),
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
      
      <div style={styles.videoContainer}>
        {isGenerating ? (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Generating video... Please wait.
          </div>
        ) : error ? (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Error: {error}
          </div>
        ) : videoUrl ? (
          <video
            style={styles.video}
            src={videoUrl}
            controls
            autoPlay
            onError={() => setError('Failed to load video')}
          />
        ) : (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Enter text to generate an avatar video
          </div>
        )}
      </div>

      {/* Avatar Selection */}
      <div>
        <h3>Select an Avatar</h3>
        <div style={styles.avatarOptions}>
          {avatarImages.map((avatar, index) => (
            <div 
              key={index}
              style={styles.avatarOption(selectedAvatar === index)}
              onClick={() => setSelectedAvatar(index)}
            >
              <img 
                src={avatar} 
                alt={`Avatar ${index + 1}`} 
                style={{
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <textarea
        style={styles.textArea(isDarkMode)}
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isGenerating}
      />

      <div style={styles.inputContainer}>
        <button
          onClick={handleGenerateVideo}
          style={styles.button('#007bff', isGenerating)}
          disabled={isGenerating}
        >
          <span role="img" aria-label="generate">🔄</span>
          {isGenerating ? 'Generating...' : 'Generate Video'}
        </button>
        
        <button
          onClick={() => navigate('/generate/voice-input')}
          style={styles.button('#28a745', false)}
        >
          <span role="img" aria-label="microphone">🎤</span>
          Switch to Voice Input
        </button>
        
        <button
          onClick={() => navigate('/generate/upload-audio')}
          style={styles.button('#6c757d', false)}
        >
          <span role="img" aria-label="upload">📁</span>
          Upload Audio File
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Try more features section */}
      <h3 style={{marginTop: '40px'}}>Try more features</h3>
      <div style={styles.featuresRow}>
        <div 
          style={styles.featureCard(isDarkMode)}
          onClick={() => navigate('/generate/upload-video')}
        >
          <h3>Video Dubbing</h3>
          <p>Upload video and select language to generate dubbed video</p>
        </div>
        
        <div 
          style={styles.featureCard(isDarkMode)}
          onClick={() => navigate('/generate/social-media-content')}
        >
          <h3>Social Media Content Generator</h3>
          <p>Select topic and generate video</p>
        </div>
      </div>
    </div>
  );
}

export default TextScript;  