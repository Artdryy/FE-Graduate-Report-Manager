// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import the decoder
import MainLayout from '../components/layout/MainLayout';

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Get time in seconds

    // If token is expired, remove it and redirect to login
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // If token is invalid for any reason, clear storage and redirect
    console.error("Invalid token:", error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/login" />;
  }

  // If token is valid, render the layout
  return <MainLayout />;
};

export default ProtectedRoute;