// src/components/common/ProtectedRoute.js
import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { loggedIn } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // 非同期処理を模倣
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  console.log('ProtectedRoute - loggedIn:', loggedIn);
  console.log('ProtectedRoute - isLoading:', isLoading);

  if (isLoading) {
    return <div>Loading...</div>; // またはローディングスピナーなど
  }

  if (!loggedIn) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - Rendering children');
  return children;
};

export default ProtectedRoute;