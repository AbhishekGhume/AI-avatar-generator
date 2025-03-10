import React, { useState, useRef } from 'react';
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
  input: {
    width: '80%',
    maxWidth: '600px',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    margin: '20px 0',
  },
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
    margin: '0 10px',
  }),
  regenerateButton: (isDark, disabled) => ({
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#999' : isDark ? '#4CAF50' : '#4CAF50',
    color: 'white',
    opacity: disabled ? 0.7 : 1,
    margin: '0 10px',
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
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
  statusMessage: (isSuccess) => ({
    marginTop: '15px',
    color: isSuccess ? '#28a745' : '#dc3545',
    fontSize: '14px',
  }),
};

function SocialMediaContent({ isDarkMode }) {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const generateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsGeneratingScript(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/generate-script', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.script) {
        setScript(data.script);
      } else {
        throw new Error(data.error || 'Failed to generate script');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setError('Failed to generate script. Please try again.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const regenerateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsGeneratingScript(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/regenerate-script', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.script) {
        setScript(data.script);
      } else {
        throw new Error(data.error || 'Failed to regenerate script');
      }
    } catch (error) {
      console.error('Error regenerating script:', error);
      setError('Failed to regenerate script. Please try again.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateVideo = async () => {
    if (!script.trim()) {
      setError('Please generate a script first.');
      return;
    }

    setIsGeneratingVideo(true);
    setError(null);
    setEmailStatus(null);
    setVideoUrl(null);

    try {
      const response = await fetch('http://localhost:5000/generate-social-video', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const videoUrl = `http://localhost:5000${data.videoUrl}?t=${Date.now()}`;
        setVideoUrl(videoUrl);
        setEmailStatus(data.emailSent ? 'sent' : 'failed');
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setError('Failed to generate video. Please try again.');
      setEmailStatus('failed');
    } finally {
      setIsGeneratingVideo(false);
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

      <h1>Social Media Content Generator</h1>
      
      <input
        style={styles.input}
        type="text"
        placeholder="Enter topic for your social media content..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={isGeneratingScript || isGeneratingVideo}
      />

      <div style={styles.buttonContainer}>
        <button
          onClick={generateScript}
          style={styles.button(isDarkMode, isGeneratingScript || isGeneratingVideo)}
          disabled={isGeneratingScript || isGeneratingVideo}
        >
          {isGeneratingScript ? 'Generating Script...' : 'Generate Script'}
        </button>
      </div>

      {script && (
        <>
          <textarea
            style={styles.textArea}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            disabled={isGeneratingScript || isGeneratingVideo}
            readOnly={false}
          />

          <div style={styles.buttonContainer}>
            <button
              onClick={regenerateScript}
              style={styles.regenerateButton(isDarkMode, isGeneratingScript || isGeneratingVideo)}
              disabled={isGeneratingScript || isGeneratingVideo}
            >
              Regenerate Script
            </button>
            <button
              onClick={generateVideo}
              style={styles.button(isDarkMode, isGeneratingVideo)}
              disabled={isGeneratingVideo}
            >
              {isGeneratingVideo ? 'Generating Video...' : 'Generate Video'}
            </button>
          </div>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={styles.videoContainer}>
        {isGeneratingVideo ? (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Generating video... Please wait.
          </div>
        ) : error ? (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Error: {error}
          </div>
        ) : videoUrl ? (
          <video
            ref={videoRef}
            style={styles.video}
            src={videoUrl}
            playsInline
            controls
            autoPlay
            onError={() => setError('Failed to load video')}
          />
        ) : (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Video will appear here
          </div>
        )}
      </div>

      {emailStatus && (
        <p style={styles.statusMessage(emailStatus === 'sent')}>
          {emailStatus === 'sent' 
            ? 'Video has been sent to your email!' 
            : 'Failed to send email. Video saved in history.'}
        </p>
      )}
    </div>
  );
}

export default SocialMediaContent;