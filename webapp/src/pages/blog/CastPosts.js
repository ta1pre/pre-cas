// src/pages/blog/CastPosts.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPosts } from '../../api/blogAPI';
import { Typography, CircularProgress } from '@mui/material';
import BlogPostCard from '../../components/blog/BlogPostCard';

const CastPosts = () => {
  const { castId } = useParams();  // URLパラメータからキャストIDを取得
  const [posts, setPosts] = useState([]);     // 投稿データの初期値を空配列に設定
  const [loading, setLoading] = useState(true); // ローディング状態

  console.log("Cast ID:", castId); // URLパラメータが正しく取得できているか確認

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts(castId);  // キャストの投稿を取得
        console.log("Fetched posts:", data); // 取得したデータを確認
        setPosts(data || []);  // データがundefinedの場合は空配列を設定
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);  // エラー時も空配列に設定しておく
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [castId]);

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {castId} の投稿一覧
      </Typography>
      {posts.length === 0 ? (
        <Typography>投稿がありません</Typography>
      ) : (
        posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />  // BlogPostCardを使って投稿を表示
        ))
      )}
    </div>
  );
};

export default CastPosts;
