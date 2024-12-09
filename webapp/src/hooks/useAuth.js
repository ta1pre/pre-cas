// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { loggedIn, userProfile } = useContext(AuthContext);

  return {
    isAuthenticated: loggedIn,
    user: userProfile,
  };
};