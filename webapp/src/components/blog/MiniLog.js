// src/components/blog/MiniLog.js

import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../../api/blogAPI';
import { Box, Grid, Modal, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; 

const BASE_URL = `${process.env.REACT_APP_IMAGE_SERVER_URL}/img/i`;

const MiniLog = ({ castId }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await fetchPosts(castId, page * 9, 9);
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setHasMore(data.length > 0);
    } catch (error) {
      console.error("Error loading mini log posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 10) {
        if (hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  // 日時を "YYYY/MM/DD HH:mm" 形式にフォーマットする関数
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={4} key={post.id}>
            <Box
              component="img"
              src={`${BASE_URL}/${castId}/blog/${post.photo_url}`}  // URLの組み立て
              alt="post"
              sx={{
                width: '100%',
                height: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                cursor: 'pointer',
                borderRadius: '8px',  // 角丸の設定
              }}
              onClick={() => handleOpenModal(post)}
            />
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {!hasMore && !loading && (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          残り0ポスト
        </Typography>
      )}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="post-modal-title"
        aria-describedby="post-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedPost && (
            <>
              <Box
                component="img"
                src={`${BASE_URL}/${castId}/blog/${selectedPost.photo_url}`}
                alt="selected post"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px',
                }}
              />
              
              {/* 投稿日時の表示 */}
              <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    color: 'text.secondary',
    fontSize: '0.875rem',
    backgroundColor: '#f0f0f0',
    fontFamily: "'Roboto', sans-serif", // 読みやすいフォントに変更
  }}
>
  <AccessTimeIcon sx={{ fontSize: '1rem', mr: 1, color: '#ff8a65' }} />
  <Typography
    variant="body2"
    sx={{
      fontWeight: 'bold', // 少し強調
      color: '#d81b60', // ブランドカラーを適用
    }}
  >
    {formatDate(selectedPost.created_at)}
  </Typography>
</Box>

              {/* 本文の表示部分 */}
              <Box
                sx={{
                  p: 2,
                  overflowY: 'auto',
                  flex: 1,
                  backgroundColor: '#f0f0f0',  // 本文と同じ背景色
                }}
              >
                <Typography
                  variant="body1"
                  id="post-modal-description"
                  sx={{
                    whiteSpace: 'pre-line'
                  }}
                >
                  {selectedPost.body}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MiniLog;
