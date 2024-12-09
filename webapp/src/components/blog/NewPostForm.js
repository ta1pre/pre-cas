// src/components/blog/NewPostForm.js

import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import NewPostImageUploader from '../imageup/NewPostImageUploader';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const BASE_URL = `${process.env.REACT_APP_IMAGE_SERVER_URL}/img`;

const NewPostForm = ({ setSelectedTab }) => {
  const { userProfile } = useContext(AuthContext);
  const [photoUrl, setPhotoUrl] = useState('');  // データベース用のファイル名
  const [previewUrl, setPreviewUrl] = useState('');  // プレビュー用URL
  const [postBody, setPostBody] = useState('');  // 投稿の本文

  // 一意のファイル名を生成（日時を基に）
  const generateUniqueFileName = () => {
    const now = new Date();
    return `post_image_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.jpg`;
  };

  // 画像アップロード成功時の処理
  const handleImageUploadSuccess = (url) => {
    const uniqueFileName = generateUniqueFileName();  // 一意のファイル名を生成
    setPhotoUrl(uniqueFileName);  // データベース用のファイル名を設定
    setPreviewUrl(url);  // プレビュー用URLを設定
  };

  // tempから最終保存先に画像を移動する関数
  const moveImageFromTempToFinal = async () => {
    const endpoint = `${BASE_URL}/finalize/${userProfile?.userInvitationId}/blog`;

    try {
      const params = new URLSearchParams();
      params.append("final_name", photoUrl);  // 最終保存用のファイル名

      await axios.post(endpoint, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

    } catch (error) {
      console.error("画像移動エラー:", error);
      alert("画像の移動に失敗しました");
    }
  };

  // 投稿データを送信する関数
  const handleSubmit = async () => {
    if (!postBody || !photoUrl) {
      alert("本文と画像は必須です");
      return;
    }

    try {
      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/blog/${userProfile?.userInvitationId}/posts`;

      const response = await axios.post(endpoint, {
        body: postBody,
        photo_url: photoUrl,  // 「post_image_YYYYMMDDHHMMSS.jpg」を送信
        status: "public",
      });

      if (response.status === 200) {
        await moveImageFromTempToFinal();  // 投稿成功後に画像を移動
        alert("投稿が成功しました！");
        setSelectedTab(1);  // 投稿管理タブ（インデックス1）に移動
      }
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("接続に失敗しました");
    }
  };

  return (
    <Box sx={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <Typography variant="h6">新規投稿作成</Typography>

      {/* 画像アップローダー */}
      <NewPostImageUploader castId={userProfile?.userInvitationId} onUploadSuccess={handleImageUploadSuccess} />

      {/* アップロードされた画像のプレビュー */}
      {previewUrl && (
        <img src={previewUrl} alt="Uploaded Preview" style={{ width: '100%', marginTop: 10, borderRadius: 4 }} />
      )}

      {/* 投稿の本文入力フィールド */}
      <TextField
        label="本文"
        multiline
        rows={4}
        value={postBody}
        onChange={(e) => setPostBody(e.target.value)}
        fullWidth
        sx={{ marginTop: 2 }}
      />

      {/* 投稿ボタン */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ marginTop: 2 }}
      >
        投稿する
      </Button>
    </Box>
  );
};

export default NewPostForm;
