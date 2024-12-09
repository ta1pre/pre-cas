// src/api/userAPI.js

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true
});

// プロフィールの簡易更新用(最初の性別判定)
export const updateUserProfile = async (userData) => {
  try {
    const formattedUserData = {
      line_id: userData.line_id,
      sex: userData.sex,
      type: userData.type
    };
    console.log('Sending API request:', formattedUserData);
    const response = await api.post('/api/user/update-profile', formattedUserData);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// アカウントの詳細更新用
export const updateUserAccount = async (userData) => {
  try {
    const formattedUserData = {
      line_id: userData.line_id,
      nick_name: userData.nick_name,
      prefectures: userData.prefectures,
      birth: userData.birth,
      email: userData.email || null,
      mobile_phone: userData.mobile_phone,
      sex: userData.sex,
      type: userData.type,
      affi_type: userData.affi_type,
      last_login: userData.last_login
    };
    console.log('Sending API request for detailed account update:', JSON.stringify(formattedUserData, null, 2));
    const response = await api.post('/api/user/update-profile', formattedUserData);
    console.log('API response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error updating user account:', error);
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};
