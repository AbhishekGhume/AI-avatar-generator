import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0', // Add any styles you prefer
  },
  LoginBox: {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
};

function Login() {
  const { user, googleSignIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google script loaded');
      if (window.google) {
        // Initialize Google Sign-In API
        window.google.accounts.id.initialize({
          // client_id: process.env.GOOGLE_CLIENT_ID, // Ensure this is being read correctly
          client_id: "853474935714-bue5g87qqhjbrk30g6a24mrqnb4gbp19.apps.googleusercontent.com", // Ensure this is being read correctly
          callback: handleCredentialResponse,
        });

        // Render the Google Sign-In button
        const buttonElement = document.getElementById('googleButton');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
          });
          console.log('Google Sign-In button rendered');
        } else {
          console.error('#googleButton element not found');
        }
      } else {
        console.error('Google object is not defined');
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google script');
    };

    // Append the script to the document body
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Redirect to dashboard if the user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCredentialResponse = async (response) => {
    console.log('Credential response:', response); // Debug log
    try {
      // Pass the Google token to your authentication API
      await googleSignIn(response.credential);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.LoginBox}>
        <h2>Welcome</h2>
        {/* Google Sign-In button will be rendered here */}
        <div id="googleButton"></div>
      </div>
    </div>
  );
}

export default Login;