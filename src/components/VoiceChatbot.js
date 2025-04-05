import React, { useState, useEffect, useRef } from 'react';
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
  statusMessage: (isSuccess) => ({
    marginTop: '15px',
    color: isSuccess ? '#28a745' : '#dc3545',
    fontSize: '14px',
  }),
  recordingStatus: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#dc3545',
    fontWeight: 'bold',
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
    transition: 'all 0.3s ease'
  }),
};

function VoiceChatbot({ isDarkMode }) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [error, setError] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const avatarImages = [avatar1, avatar2, avatar3, avatar4];

  // Setup media recorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = handleAudioStop;
      
      // Start recording
      mediaRecorder.start(200); // Save data every 200ms
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear the recording timer
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
    }
  };

  const handleAudioStop = async () => {
    try {
      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      
      // Create form data to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('avatarId', selectedAvatar);
      
      setIsGeneratingVideo(true);
      setError(null);
      setEmailStatus(null);
      setVideoUrl(null);
      
      // Submit audio to server
      const response = await fetch('http://localhost:5000/generate-from-audio', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        const videoUrl = `http://localhost:5000${data.videoUrl}?t=${Date.now()}`;
        setVideoUrl(videoUrl);
        setEmailStatus(data.emailSent ? 'sent' : 'failed');
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      setError('Failed to process audio: ' + (error.message || 'Unknown error'));
      setEmailStatus('failed');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing recording
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Format seconds into mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container(isDarkMode)}>
      <button 
        style={styles.backButton(isDarkMode)}
        onClick={() => navigate('/')}
      >
        ← Back to Dashboard
      </button>

      <h1>Voice to Avatar Converter</h1>
      
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
            Record your voice to generate an avatar video
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

      {isRecording && (
        <div style={styles.recordingStatus}>
          Recording in progress: {formatTime(recordingDuration)}
        </div>
      )}

      <div style={styles.inputContainer}>
        <button
          onClick={handleMicClick}
          style={styles.button(isRecording ? '#dc3545' : '#007bff', isGeneratingVideo)}
          disabled={isGeneratingVideo}
        >
          <span role="img" aria-label="microphone">🎤</span>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        <button
          onClick={() => navigate('/generate/text-script')}
          style={styles.button('#28a745', false)}
        >
          <span role="img" aria-label="text">📝</span>
          Switch to Text Input
        </button>
        
        <button
          onClick={() => navigate('/generate/upload-audio')}
          style={styles.button('#6c757d', false)}
        >
          <span role="img" aria-label="upload">📁</span>
          Upload Audio File
        </button>
      </div>

      {emailStatus && (
        <p style={styles.statusMessage(emailStatus === 'sent')}>
          {emailStatus === 'sent' 
            ? 'Video has been sent to your email!' 
            : 'Failed to send email. Video saved in history.'}
        </p>
      )}

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

export default VoiceChatbot;