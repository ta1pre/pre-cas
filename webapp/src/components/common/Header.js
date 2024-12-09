// src/components/common/Header.js
import React, { useState, useEffect, useContext } from 'react';
import { AppBar, Toolbar, IconButton, Drawer, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NavigationMenu from './NavigationMenu';
import { AuthContext } from '../../context/AuthContext';
import UserMenu from '../auth/UserMenu';
import logoImage from '../../assets/images/logo_b.png'; 

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { loggedIn, userProfile } = useContext(AuthContext);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) > 20) { // 20px以上スクロールした場合のみ反応
      setIsVisible(currentScrollY < lastScrollY); // 上スクロールで表示、下スクロールで非表示
    }
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AppBar
      position="fixed"
      sx={{ 
        backgroundColor: 'transparent',
        top: isVisible ? '0' : '-60px',
        transition: 'top 0.2s ease-in-out', // 速くて自然なトランジション
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ color: 'lightgray' }}
        >
          <MenuIcon sx={{ color: 'lightgray' }} />
        </IconButton>
        <Box
          component="img"
          sx={{
            height: 40,
            width: 'auto',
            maxHeight: { xs: 30, md: 40 },
            maxWidth: { xs: 100, md: 150 },
            mr: 2,
          }}
          alt="Logo"
          src={logoImage}
        />
        <Box sx={{ flexGrow: 0 }}>
          <UserMenu />
        </Box>
        <Drawer 
          anchor="left" 
          open={drawerOpen} 
          onClose={toggleDrawer(false)}
          sx={{ 
            '& .MuiDrawer-paper': { 
              backgroundColor: '#444',
              color: '#fff'
            } 
          }}
        >
          <div
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <NavigationMenu loggedIn={loggedIn} userProfile={userProfile} />
          </div>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
