// src/components/auth/UserMenu.js
import React, { useState, useContext } from 'react';
import { Button, Menu, MenuItem, Avatar } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { loggedIn, setLoggedIn, userProfile, setUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const currentPath = encodeURIComponent(window.location.pathname);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/register/login?page=${currentPath}`);
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error initiating login process', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_BASE_URL}/api/register/logout`, { withCredentials: true });
      setLoggedIn(false);
      setUserProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!loggedIn) {
    return (
      <Button
        variant="contained"
        style={{
          backgroundColor: '#00B900',
          color: 'white',
          fontWeight: 'bold',
        }}
        onClick={handleLogin}
      >
        LINEで簡単ログイン
      </Button>
    );
  }

  const profileUrl = userProfile?.userSex === "woman" && userProfile?.userInvitationId
    ? `${process.env.REACT_APP_BASE_URL}/cast/${userProfile.userInvitationId}/profile`
    : null;

  return (
    <>
      <Avatar
        alt={userProfile?.displayName || 'User'}
        src={userProfile?.pictureUrl || '/static/images/avatar/1.jpg'}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { navigate('/mypage'); handleClose(); }}>マイページ</MenuItem>
        <MenuItem onClick={() => { navigate('/mypage/account'); handleClose(); }}>アカウント</MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>設定</MenuItem>
        <MenuItem onClick={() => { 
          navigate('/blog'); 
          handleClose(); 
        }}>
          ブログ
        </MenuItem>
        {profileUrl && (
          <MenuItem onClick={() => { 
            navigate(profileUrl.replace(process.env.REACT_APP_BASE_URL, '')); 
            handleClose(); 
          }}>
            プロフィール
          </MenuItem>
        )}
        
        {userProfile?.userSex === "woman" && userProfile?.userInvitationId && (
          <MenuItem onClick={() => { 
            navigate(`/cast/${userProfile.userInvitationId}/edit-schedule`); 
            handleClose(); 
          }}>
            スケジュール編集
          </MenuItem>
        )}
        
        {/* "type" が "THERAPIST" の場合に表示するメニュー項目 */}
        {userProfile?.type === "THERAPIST" && (
          <MenuItem onClick={() => { 
            navigate(`${process.env.REACT_APP_BASE_URL}/resvlist`.replace(process.env.REACT_APP_BASE_URL, '')); 
            handleClose(); 
          }}>
            予約管理
          </MenuItem>
        )}
        {userProfile?.type === "USER" && (
  <MenuItem onClick={() => { 
    navigate(`/resvuserlist`); 
    handleClose(); 
  }}>
    予約一覧
  </MenuItem>
)}


        <MenuItem onClick={() => { handleLogout(); handleClose(); }}>ログアウト</MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
