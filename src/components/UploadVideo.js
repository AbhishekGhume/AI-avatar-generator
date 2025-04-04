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
  select: (isDark) => ({
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    marginLeft: '10px',
    backgroundColor: isDark ? '#333' : '#fff',
    color: isDark ? 'white' : 'black',
  }),
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

function UploadVideo({ isDarkMode }) {
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('targetLanguage', language);

    try {
      const response = await fetch('http://localhost:5000/generate-dubbed-video', {
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

      <h1>Video Dubbing</h1>
      
      <input
        type="file"
        accept=".mp4,.mov,.avi"
        onChange={handleFileChange}
        style={styles.fileInput}
        disabled={isGenerating}
      />

      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        style={styles.select(isDarkMode)}
        disabled={isGenerating}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleUpload}
        style={styles.button(isDarkMode, isGenerating)}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Dubbed Video'}
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
            {isGenerating ? 'Generating video...' : 'Dubbed video will appear here'}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadVideo;