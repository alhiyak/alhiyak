import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '20px' }}>جاري التحميل...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;