// src/pages/Home.js
import React, { useContext } from 'react';
import { Container, Box, Typography } from '@mui/material';
import UserProfile from '../components/profile/UserProfile';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { loggedIn, userProfile } = useContext(AuthContext);

  return (
    <Container maxWidth="md" sx={{ backgroundColor: 'lightgray' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          {loggedIn && <UserProfile userProfile={userProfile} />}
        </Box>
        <Typography variant="h2" component="h1" gutterBottom>
          こんにちは
        </Typography>
        <Typography variant="body1">
          This is the content of the home page.
        </Typography>
      </Box>
    </Container>
  );
}

export default Home;
