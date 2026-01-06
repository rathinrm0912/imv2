import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MockAuthProvider, useMockAuth } from './contexts/MockAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import UserManagement from './pages/UserManagement';

// Use mock auth if enabled
const USE_MOCK_AUTH = process.env.REACT_APP_USE_MOCK_AUTH === 'true';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authHook = USE_MOCK_AUTH ? useMockAuth : useAuth;
  const { user, loading } = authHook();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const AuthContextProvider = USE_MOCK_AUTH ? MockAuthProvider : AuthProvider;
  
  return (
    <ThemeProvider>
      <AuthContextProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:id"
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
