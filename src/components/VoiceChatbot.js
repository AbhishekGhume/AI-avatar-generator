import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

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
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  button: (color, disabled) => ({
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#999' : color,
    color: 'white',
    opacity: disabled ? 0.7 : 1,
  }),
  statusMessage: (isSuccess) => ({
    marginTop: '15px',
    color: isSuccess ? '#28a745' : '#dc3545',
    fontSize: '14px',
  }),
};

function VoiceChatbot({ isDarkMode }) {
  // const { user } = useAuth();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const cleanResponseText = (text) => {
    return text
      .replace(/["'()]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\. /g, ', ')
      .trim();
  };

  const handleChatbotResponse = async (userInput) => {
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const cleanedText = cleanResponseText(data.response);
        await generateAvatarVideo(cleanedText);
      } else {
        console.error('Error in bot response:', data);
        setError('Failed to get response from server');
      }
    } catch (error) {
      console.error('Communication error:', error);
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleChatbotResponse(transcript);
      };

      speechRecognition.onend = () => setIsListening(false);
      setRecognition(speechRecognition);
    }
  }, []);

  const generateAvatarVideo = async (text) => {
    setIsGeneratingVideo(true);
    setError(null);
    setEmailStatus(null);
    setVideoUrl(null);

    try {
      const response = await fetch('http://localhost:5000/generate-avatar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const videoUrl = `http://localhost:5000${data.videoUrl}?t=${Date.now()}`;
        setVideoUrl(videoUrl);
        setEmailStatus(data.emailSent ? 'sent' : 'failed');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setError('Failed to generate video. Please try again.');
      setEmailStatus('failed');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopSpeech = () => {
    if (recognition) recognition.stop();
    if (videoRef.current) videoRef.current.pause();
    setIsListening(false);
  };

  return (
    <div style={styles.container(isDarkMode)}>
      <button 
        style={styles.backButton(isDarkMode)}
        onClick={() => navigate('/')}
      >
        ← Back to Dashboard
      </button>

      <h1>Voice Chatbot with Avatar</h1>
      
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
            key={videoUrl}
            src={videoUrl}
            playsInline
            controls
            autoPlay
            onError={() => setError('Failed to load video')}
          />
        ) : (
          <div style={styles.placeholderVideo(isDarkMode)}>
            Avatar will appear here
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button
          onClick={handleMicClick}
          style={styles.button('#007bff', isGeneratingVideo)}
          disabled={isGeneratingVideo}
        >
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        <button
          onClick={stopSpeech}
          style={styles.button('#dc3545', isGeneratingVideo)}
          disabled={isGeneratingVideo}
        >
          Stop Video
        </button>
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

export default VoiceChatbot;
