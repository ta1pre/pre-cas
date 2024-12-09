// src/components/auth/AuthButtons.js
import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthButtons = () => {
  const { loggedIn, setLoggedIn, setUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      console.log('Initiating login process...');
      const currentPath = encodeURIComponent(window.location.pathname);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/register/login?page=${currentPath}`);
      console.log('Login URL:', response.data.auth_url);
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error initiating login process', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await axios.get(`${process.env.REACT_APP_BASE_URL}/api/register/logout`, { withCredentials: true });
      setLoggedIn(false);
      setUserProfile(null);
      console.log('Logged out');
      navigate('/'); // ログアウト後にホームページにリダイレクト
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const lineButtonStyle = {
    backgroundColor: '#00B900',
    color: 'white',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#00a000',
    },
  };

  return (
    <div>
      {loggedIn ? (
        <Button variant="contained" color="primary" onClick={handleLogout}>
          ログアウト
        </Button>
      ) : (
        <Button 
          variant="contained" 
          style={lineButtonStyle}
          onClick={handleLogin}
        >
          LINEでログイン
        </Button>
      )}
    </div>
  );
};

export default AuthButtons;