// src/pages/blog/Blog.js
import React, { useState } from 'react';
import { Tabs, Tab, Box, Container } from '@mui/material';
import NewPostForm from '../../components/blog/NewPostForm';

const Blog = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 2, textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5em' }}>ブログ管理</h1>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        centered
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          marginBottom: 2,
        }}
      >
        <Tab label="新規投稿" />
        <Tab label="投稿管理" />
      </Tabs>

      {/* タブの内容表示部分 */}
      <Box sx={{ marginTop: 2 }}>
        {/* setSelectedTab を NewPostForm に渡す */}
        {selectedTab === 0 && <NewPostForm setSelectedTab={setSelectedTab} />}
      </Box>
    </Container>
  );
};

export default Blog;
