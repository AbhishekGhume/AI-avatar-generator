import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import avatar1 from '../avatars/avatar1.jpg';
import avatar2 from '../avatars/avatar2.jpg';
import avatar3 from '../avatars/avatar3.jpg';
import avatar4 from '../avatars/avatar4.jpg';

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
  button: (isDark, disabled) => ({
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#999' : '#007bff',
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
    backgroundColor: disabled ? '#999' : '#4CAF50',
    color: 'white',
    opacity: disabled ? 0.7 : 1,
    margin: '0 10px',
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
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const avatarImages = [avatar1, avatar2, avatar3, avatar4];

  const generateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsGeneratingScript(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/generate-script', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Script failed');
      setScript(data.script);
    } catch (err) {
      console.error(err);
      setError('Failed to generate script.');
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
      const res = await fetch('http://localhost:5000/regenerate-script', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Regeneration failed');
      setScript(data.script);
    } catch (err) {
      console.error(err);
      setError('Failed to regenerate script.');
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
      const res = await fetch('http://localhost:5000/generate-social-video', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          avatarId: selectedAvatar
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Video failed');
      setVideoUrl(`http://localhost:5000${data.videoUrl}?t=${Date.now()}`);
      setEmailStatus(data.emailSent ? 'sent' : 'failed');
    } catch (err) {
      console.error(err);
      setError('Failed to generate video.');
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
            readOnly
          />

          <div style={styles.buttonContainer}>
            <button
              onClick={regenerateScript}
              style={styles.regenerateButton(isDarkMode, isGeneratingScript)}
              disabled={isGeneratingScript}
            >
              Regenerate Script
            </button>
          </div>

          {/* ←– Avatar Selection ––→ */}
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

          <div style={styles.buttonContainer}>
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
