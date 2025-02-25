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
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px',
    marginTop: '80px',
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
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
    color: 'white',
  },
};

function Dashboard({ isDarkMode, setIsDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI Voice-to-Video',
      description: 'Generate avatar video by giving voice input with groq api',
      path: '/generate/voice-input',
    },
    {
      title: 'Audio-to-Video Creator',
      description: 'Upload Audio & Generate video',
      path: '/generate/upload-audio',
    },
    {
      title: 'Text-to-Video Generator',
      description: 'Write script & Generate video',
      path: '/generate/text-script',
    },
  ];

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

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
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.cardsContainer}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              ...(isDarkMode ? styles.darkCard : {}),
              minHeight: '150px',
            }}
            onClick={() => navigate(feature.path)}
          >
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;