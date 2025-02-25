import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const controller = new AbortController();
    
    const checkUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/user', {
          withCredentials: true,
          signal: controller.signal
        });
        setUser(data.user);
        setError(null);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setUser(null);
          setError(error.response?.data?.message || 'Authentication check failed');
          console.error('Auth check error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Cleanup function to cancel ongoing requests
    return () => controller.abort();
  }, []);

  // Google Sign In
  const googleSignIn = async (googleToken) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/google',
        { token: googleToken },
        { withCredentials: true }
      );
      setUser(data.user);
      setError(null);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Google sign in failed');
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Logout failed');
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
        withCredentials: true
      });
      setUser(data.user);
      setError(null);
      return data;
    } catch (error) {
      setUser(null);
      setError(error.response?.data?.message || 'Token refresh failed');
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  // Set up axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshToken();
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    googleSignIn,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}