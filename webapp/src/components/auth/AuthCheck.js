// src/components/auth/AuthCheck.js

import React, { useEffect, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ForcedRegistrationPopup from './ForcedRegistrationPopup';
import { updateUserProfile } from '../../api/userAPI';

function AuthCheck() {
  const { setLoggedIn, setUserProfile, userProfile } = useContext(AuthContext);
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // 整形済みフィールド名でURLパラメータを取得
    const userId = params.get('userId');
    const displayName = params.get('displayName');
    const userPrefectures = params.get('user_prefectures');
    const pictureUrl = params.get('pictureUrl');
    const userType = params.get('type');
    const isFriend = params.get('isFriend') === 'true';
    const userInvitationId = params.get('user_invitation_id');
    const userEmail = params.get('user_email');
    const userMobilePhone = params.get('user_mobile_phone');
    const userSex = params.get('user_sex');
    const userBirth = params.get('user_birth');
    const affiType = params.get('affi_type');
    const lastLogin = params.get('last_login');
    const userCreatedAt = params.get('user_created_at');
    const userUpdatedAt = params.get('user_updated_at');

    if (userId && displayName) {
      setLoggedIn(true);
      setUserProfile(currentProfile => ({
        ...currentProfile,
        userId,
        displayName,
        userPrefectures: userPrefectures || currentProfile?.userPrefectures,
        pictureUrl: pictureUrl || currentProfile?.pictureUrl,
        userType: userType || currentProfile?.userType,
        isFriend,
        userInvitationId: userInvitationId || currentProfile?.userInvitationId,
        userEmail: userEmail || currentProfile?.userEmail,
        userMobilePhone: userMobilePhone || currentProfile?.userMobilePhone,
        userSex: userSex || currentProfile?.userSex,
        userBirth: userBirth || currentProfile?.userBirth,
        affiType: affiType || currentProfile?.affiType,
        lastLogin: lastLogin || currentProfile?.lastLogin,
        userCreatedAt: userCreatedAt || currentProfile?.userCreatedAt,
        userUpdatedAt: userUpdatedAt || currentProfile?.userUpdatedAt
      }));

      // URLからクエリパラメータを削除
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, setLoggedIn, setUserProfile]);

  useEffect(() => {
    if (userProfile && (!userProfile.userType || userProfile.userType === '')) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [userProfile]);

  const handleSubmit = async (data) => {
    try {
      setUserProfile((currentProfile) => ({
        ...currentProfile,
        userSex: data.sex,
        userType: data.type
      }));
      await updateUserProfile({
        line_id: userProfile.userId, 
        sex: data.sex,
        type: data.type
      });
      setShowPopup(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <>
      <ForcedRegistrationPopup
        open={showPopup}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default AuthCheck;
