import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const MockAuthContext = createContext({});

export const useMockAuth = () => useContext(MockAuthContext);

export const MockAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mock_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('mock_profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const signup = async (email, password, displayName) => {
    setLoading(true);
    try {
      // Create mock user
      const mockUser = {
        uid: 'mock_' + Date.now(),
        email,
        displayName
      };

      const userData = {
        uid: mockUser.uid,
        email,
        display_name: displayName,
        role: 'editor',
        created_at: new Date().toISOString()
      };

      // Save to backend
      await axios.post(`${API_URL}/api/users`, userData);

      // Save locally
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify(userData));
      
      setUser(mockUser);
      setUserProfile(userData);
      
      return { user: mockUser };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Mock login - in real scenario, validate credentials
      const mockUser = {
        uid: 'mock_' + Date.now(),
        email,
        displayName: email.split('@')[0]
      };

      const userData = {
        uid: mockUser.uid,
        email,
        display_name: mockUser.displayName,
        role: 'editor',
        created_at: new Date().toISOString()
      };

      // Try to create/update user in backend
      try {
        await axios.post(`${API_URL}/api/users`, userData);
      } catch (e) {
        // User might already exist
      }

      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify(userData));
      
      setUser(mockUser);
      setUserProfile(userData);
      
      return { user: mockUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_profile');
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    signup,
    login,
    logout,
    loading
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};
