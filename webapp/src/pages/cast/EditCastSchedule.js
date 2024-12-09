// src/pages/cast/EditCastSchedule.js

import React, { useState, useContext, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import EditAllSchedule from '../../components/schedule/EditAllSchedule';

const EditCastSchedule = () => {
  const { cast_id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (userProfile?.userInvitationId !== cast_id) {
      navigate('/not-found');
    }
  }, [userProfile, cast_id, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: '100%', 
        margin: 'auto', 
        padding: { xs: 0.5, md: 2 }, 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <Box
        sx={{
          maxWidth: { md: '1200px' },
          margin: '0 auto',
          padding: { xs: 1, md: 2 },
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
          キャストスケジュール管理
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="キャストスケジュールタブ"
            variant={isDesktop ? "standard" : "fullWidth"}
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                padding: { xs: '6px 4px', sm: '6px 8px', md: '6px 16px' },
                minWidth: { xs: 0, md: 90 },
              }
            }}
          >
            <Tab label="一覧" />
            <Tab label="個別" />
            <Tab label="週間" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <EditAllSchedule castId={cast_id} />}
          {activeTab === 1 && <Typography>個別登録の機能はまだ実装されていません。</Typography>}
          {activeTab === 2 && <Typography>週間登録の機能はまだ実装されていません。</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default EditCastSchedule;