// src/api/blogAPI.js

import axios from 'axios';

// ベースURL（環境変数から取得、末尾は /api/blog で設定）
const BASE_URL = process.env.REACT_APP_BASE_URL || '';

/**
 * キャストの投稿一覧を取得
 * @param {string} castId - キャストID
 * @param {number} skip - スキップする件数（ページネーション用）
 * @param {number} limit - 取得する件数
 * @returns {Promise<Array>} - 投稿の配列
 */
export const fetchPosts = async (castId, skip = 0, limit = 10) => {
  const response = await axios.get(`${BASE_URL}/api/blog/${castId}/posts`, {
    params: { skip, limit }
  });
  return response.data.posts;
};

/**
 * 特定の投稿を取得
 * @param {number} postId - 投稿ID
 * @returns {Promise<Object>} - 投稿データ
 */
export const fetchPostById = async (postId) => {
  const response = await axios.get(`${BASE_URL}/api/blog/posts/${postId}`);
  return response.data.post;
};

/**
 * 新規投稿を作成
 * @param {string} castId - キャストID
 * @param {Object} postData - 投稿データ
 * @returns {Promise<Object>} - 作成された投稿データ
 */
export const createPost = async (castId, postData) => {
  const response = await axios.post(`${BASE_URL}/api/blog/${castId}/posts`, postData);
  return response.data.post;
};

/**
 * 投稿を更新
 * @param {number} postId - 投稿ID
 * @param {Object} updateData - 更新データ
 * @returns {Promise<Object>} - 更新された投稿データ
 */
export const updatePost = async (postId, updateData) => {
  const response = await axios.put(`${BASE_URL}/api/blog/posts/${postId}`, updateData);
  return response.data.post;
};

/**
 * 投稿を削除
 * @param {number} postId - 投稿ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  await axios.delete(`${BASE_URL}/api/blog/posts/${postId}`);
};

/**
 * いいねを追加
 * @param {number} postId - 投稿ID
 * @returns {Promise<Object>} - いいね数を更新した投稿データ
 */
export const likePost = async (postId) => {
  const response = await axios.post(`${BASE_URL}/api/blog/posts/${postId}/like`);
  return response.data.post;
};
