import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext'; 

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth(); 


  if (loading) {
    return <div>Cargando...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <MainLayout />;
};

export default ProtectedRoute;