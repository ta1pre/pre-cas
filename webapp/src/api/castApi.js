// src/api/castApi.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

export const getCastProfile = async (castId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/cast/${castId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cast profile:', error);
    throw error;
  }
};

export const createCastProfile = async (castId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/cast/${castId}/create`);
    return response.data;
  } catch (error) {
    console.error("Error creating cast profile:", error);
    throw error;
  }
};

// 必要に応じて、他のキャスト関連のAPI関数をここに追加できます