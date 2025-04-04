import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VoiceChatbot from './components/VoiceChatbot';
import UploadAudio from './components/UploadAudio';
import TextScript from './components/TextScript';
import SocialMediaGenerator from './components/SocialMediaContent';
import { useAuth } from './contexts/AuthContext';
import UploadVideo from './components/UploadVideo';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard 
                  isDarkMode={isDarkMode} 
                  setIsDarkMode={setIsDarkMode} 
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/generate/voice-input"
            element={
              <PrivateRoute>
                <VoiceChatbot isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/generate/upload-audio"
            element={
              <PrivateRoute>
                <UploadAudio isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/generate/text-script"
            element={
              <PrivateRoute>
                <TextScript isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
  path="/generate/upload-video"
  element={
    <PrivateRoute>
      <UploadVideo isDarkMode={isDarkMode} />
    </PrivateRoute>
  }
/>
          <Route
            path="/generate/social-media-content"
            element={
              <PrivateRoute>
                <SocialMediaGenerator isDarkMode={isDarkMode} />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;