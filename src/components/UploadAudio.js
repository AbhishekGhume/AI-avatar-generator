import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import avatar1 from '../avatars/avatar1.jpg';
import avatar2 from '../avatars/avatar2.jpg';
import avatar3 from '../avatars/avatar3.jpg';
import avatar4 from '../avatars/avatar4.jpg';

const styles = {
  container: (isDark) => ({
    textAlign: 'center',
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
  fileInput: (isDark) => ({
    margin: '20px 0',
    padding: '10px',
    fontSize: '16px',
    backgroundColor: isDark ? '#333' : '#fff',
    color: isDark ? '#fff' : '#000',
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#555' : '#ccc'}`,
  }),
  fileInputWrapper: (isDark) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    border: `2px dashed ${isDark ? '#555' : '#ccc'}`,
    borderRadius: '10px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: isDark ? '#2d2d2d' : '#fff',
  }),
  videoContainer: {
    width: '100%',
    maxWidth: '800px',
    height: 'auto',
    aspectRatio: '16/9',
    margin: '60px auto 20px',
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
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
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
    transition: 'all 0.3s ease',
  }),
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

function AudioUpload({ isDarkMode }) {
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const navigate = useNavigate();

  const avatarImages = [avatar1, avatar2, avatar3, avatar4];

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
    formData.append('avatarId', selectedAvatar);

    try {
      const response = await fetch('http://localhost:5000/generate-from-audio', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.videoUrl) {
        setVideoUrl(`http://localhost:5000${data.videoUrl}?t=${Date.now()}`);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Error generating video:', err);
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
            Upload an audio file to generate an avatar video
          </div>
        )}
      </div>

      <h3>Select an Avatar</h3>
      <div style={styles.avatarOptions}>
        {avatarImages.map((src, idx) => (
          <div
            key={idx}
            style={styles.avatarOption(selectedAvatar === idx)}
            onClick={() => setSelectedAvatar(idx)}
          >
            <img
              src={src}
              alt={`Avatar ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </div>

      <div style={styles.fileInputWrapper(isDarkMode)}>
        <input
          type="file"
          accept=".wav,.mp3,.mpeg"
          onChange={handleFileChange}
          style={styles.fileInput(isDarkMode)}
          disabled={isGenerating}
        />
        {file && <p>Selected file: {file.name}</p>}
      </div>

      <div style={styles.inputContainer}>
        <button
          onClick={handleUpload}
          style={styles.button('#007bff', isGenerating)}
          disabled={isGenerating}
        >
          <span role="img" aria-label="generate">🔄</span>
          {isGenerating ? 'Generating...' : 'Generate Video'}
        </button>

        <button
          onClick={() => navigate('/generate/text-script')}
          style={styles.button('#28a745', false)}
        >
          <span role="img" aria-label="text">📝</span>
          Switch to Text Input
        </button>

        <button
          onClick={() => navigate('/generate/voice-input')}
          style={styles.button('#6c757d', false)}
        >
          <span role="img" aria-label="microphone">🎤</span>
          Record Voice
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3 style={{ marginTop: '40px' }}>Try more features</h3>
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

export default AudioUpload;
