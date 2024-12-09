// src/utils/stepChecks/checkProfileSetup.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

export const checkProfileSetup = async (userProfile) => {
  if (!userProfile || !userProfile.userInvitationId) {
    return { completed: false, redirectUrl: null };
  }

  const castId = userProfile.userInvitationId;
  try {
    const response = await axios.get(`${BASE_URL}/api/cast/${castId}/profile`, {
      withCredentials: true
    });

    const profileData = response.data.profile;

    // キャストの行が存在しない、またはキャスト名が「未設定」の場合
    if (!profileData || profileData.name === "未設定") {
      return { completed: false, redirectUrl: `${BASE_URL}/cast/${castId}/profile` };
    }

    // プロフィール設定が完了している場合
    return { completed: true, redirectUrl: null };
  } catch (error) {
    console.error('Failed to fetch cast profile:', error);
    return { completed: false, redirectUrl: `${BASE_URL}/cast/${castId}/profile` };
  }
};
