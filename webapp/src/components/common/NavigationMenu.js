// src/components/common/NavigationMenu.js
import React from 'react';
import { List, ListItem, ListItemText, Icon } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';

const NavigationMenu = ({ loggedIn, userProfile }) => {
  const location = useLocation();

  return (
    <List>
      <ListItem
        button
        component={Link}
        to="/"
        sx={{
          backgroundColor: location.pathname === '/' ? 'lightgray' : 'transparent',
          '&:hover': {
            backgroundColor: 'darkgray ',
          }
        }}
      >
        <Icon
          component={HomeIcon}
          sx={{ color: location.pathname === '/' ? '#fff' : '#fff' }}
        />
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to="/about"
        sx={{
          backgroundColor: location.pathname === '/about' ? 'lightgray' : 'transparent',
          '&:hover': {
            backgroundColor: 'darkgray',
          }
        }}
      >
        <Icon
          component={InfoIcon}
          sx={{ color: location.pathname === '/about' ? '#fff' : '#fff' }}
        />
        <ListItemText primary="About" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to="/help"
        sx={{
          backgroundColor: location.pathname === '/help' ? 'lightgray' : 'transparent',
          '&:hover': {
            backgroundColor: 'darkgray',
          }
        }}
      >
        <Icon
          component={HelpIcon}
          sx={{ color: location.pathname === '/help' ? '#fff' : '#fff' }}
        />
        <ListItemText primary="ヘルプ" />
      </ListItem>
      {loggedIn && (
        <ListItem>
          <ListItemText primary={`Welcome, ${userProfile?.displayName}`} />
        </ListItem>
      )}
    </List>
  );
};

export default NavigationMenu;
