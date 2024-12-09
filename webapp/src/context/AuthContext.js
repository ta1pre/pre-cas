// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('loggedIn') === 'true';
  });

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        if (userProfile && userProfile.userId) {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/user/get-profile`,
            { params: { line_id: userProfile.userId } }
          );
          const profileData = response.data.user_profile;

          // 整形済みのフィールド名でデータを保存
          const formattedProfile = {
            userId: profileData.line_id,
            displayName: profileData.nick_name,
            userPrefectures: profileData.prefectures,
            pictureUrl: profileData.picture_url,
            userType: profileData.type,
            isFriend: true,
            userInvitationId: profileData.invitation_id,
            userSex: profileData.sex,
            userBirth: profileData.birth,
            userCreatedAt: profileData.created_at,
            userUpdatedAt: profileData.updated_at,
            userEmail: profileData.email,
            userMobilePhone: profileData.mobile_phone,
            lastLogin: profileData.last_login,
          };

          setUserProfile(formattedProfile);
          localStorage.setItem('userProfile', JSON.stringify(formattedProfile));
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn);
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [loggedIn, userProfile]);

// AuthContext.js

const updateUserProfile = async (updatedProfile) => {
    setLoading(true);
    try {
      // APIに送信するデータをAPI形式に変換
      const profileData = {
        line_id: userProfile.userId,
        nick_name: updatedProfile.displayName || userProfile.displayName,
        prefectures: updatedProfile.userPrefectures || userProfile.userPrefectures,
        birth: updatedProfile.userBirth || userProfile.userBirth,
        email: updatedProfile.userEmail !== undefined ? updatedProfile.userEmail : userProfile.userEmail,
        mobile_phone: updatedProfile.userMobilePhone || userProfile.userMobilePhone,
        sex: updatedProfile.userSex || userProfile.userSex,       
        type: updatedProfile.userType || userProfile.userType,     
        picture_url: updatedProfile.pictureUrl || userProfile.pictureUrl, // pictureUrl を追加
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/user/update-profile`,
        profileData
      );

      const updatedData = response.data.user;

      // 整形済みの形式で保存
      const formattedProfile = {
        userId: updatedData.line_id,
        displayName: updatedData.nick_name,
        userPrefectures: updatedData.prefectures,
        pictureUrl: updatedData.picture_url,      // pictureUrlを設定
        userType: updatedData.type,
        isFriend: userProfile.isFriend,
        userInvitationId: updatedData.invitation_id,
        userSex: updatedData.sex,
        userBirth: updatedData.birth,
        userCreatedAt: updatedData.created_at,
        userUpdatedAt: updatedData.updated_at,
        userEmail: updatedData.email,
        userMobilePhone: updatedData.mobile_phone,
        lastLogin: updatedData.last_login,
      };

      setUserProfile(formattedProfile);
      localStorage.setItem('userProfile', JSON.stringify(formattedProfile));

      return updatedData;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, userProfile, setUserProfile, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
