// src/components/blog/BlogPostCard.js

import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

const BlogPostCard = ({ post }) => {
  return (
    <Card sx={{ marginBottom: 2 }}>
      {post.photo_url && (
        <CardMedia component="img" height="200" image={post.photo_url} alt="post" />
      )}
      <CardContent>
        <Typography variant="h6">{post.body}</Typography>
        <Typography variant="body2" color="text.secondary">
          投稿日時: {new Date(post.created_at).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          いいね数: {post.likes_count}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard;
