import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    position: 'relative',
  },
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  themeButton: {
    padding: '8px 16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutButton: {
    padding: '8px 16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: '#dc3545',
    color: 'white',
  },
  profilePic: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  mainContent: {
    marginTop: '80px',
    padding: '20px',
  },
  videoContainer: {
    width: '100%',
    maxWidth: '800px',
    height: 'auto',
    aspectRatio: '16/9',
    margin: '0 auto 30px',
    backgroundColor: '#000',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '18px',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '30px',
  },
  inputField: {
    padding: '10px 15px',
    borderRadius: '25px',
    border: '1px solid #ddd',
    width: '60%',
    maxWidth: '500px',
    fontSize: '16px',
  },
  actionButton: {
    padding: '10px 15px',
    borderRadius: '25px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  uploadButton: {
    padding: '10px 15px',
    borderRadius: '25px',
    border: 'none',
    backgroundColor: '#6c757d',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  featuresTitle: {
    textAlign: 'center',
    margin: '20px 0',
    fontSize: '20px',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
    minHeight: '150px',
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
    color: 'white',
  },
};

function Dashboard({ isDarkMode, setIsDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const additionalFeatures = [
    {
      title: 'Video Dubbing',
      description: 'Upload video and select language to generate dubbed video',
      path: '/generate/upload-video',
    },
    {
      title: 'Social Media Content Generator',
      description: 'Select topic and generate video',
      path: '/generate/social-media-content',
    },
    {
      title: 'More Features Coming Soon...',
      // description: 
      // path: '/generate/social-media-content',
    }
  ];

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);
  
  const goToVoiceInput = () => navigate('/generate/voice-input');
  const goToTextScript = () => navigate('/generate/text-script');
  const goToUploadAudio = () => navigate('/generate/upload-audio');

  return (
    <div style={{ 
      ...styles.container, 
      backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0',
      color: isDarkMode ? 'white' : 'black'
    }}>
      <div style={styles.topBar}>
        <div style={styles.userInfoContainer}>
          {user?.picture && (
            <img src={user.picture} alt="profile" style={styles.profilePic} />
          )}
          <span>{user?.name}</span>
        </div>
        
        <div style={styles.controls}>
          <button 
            onClick={handleThemeToggle}
            style={{
              ...styles.themeButton,
              backgroundColor: isDarkMode ? '#ffcc00' : '#007bff',
              color: isDarkMode ? 'black' : 'white'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Main Video Display Area */}
        <div style={styles.videoContainer}>
          Your Avatar video will appear here
        </div>
        
        {/* Input Area */}
        <div style={styles.inputContainer}>
          <button onClick={goToVoiceInput} style={styles.actionButton}>
            <span role="img" aria-label="microphone">🎤</span> Voice Input
          </button>
          <input 
            type="text" 
            placeholder="Type text..." 
            style={styles.inputField}
            onClick={goToTextScript}
            readOnly
          />
          <button onClick={goToUploadAudio} style={styles.uploadButton}>
            <span role="img" aria-label="upload">📁</span> Upload File
          </button>
        </div>
        
        {/* Additional Features */}
        <h3 style={styles.featuresTitle}>Try more features</h3>
        
        <div style={styles.cardsContainer}>
          {additionalFeatures.map((feature, index) => (
            <div
              key={index}
              style={{
                ...styles.card,
                ...(isDarkMode ? styles.darkCard : {})
              }}
              onClick={() => navigate(feature.path)}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;