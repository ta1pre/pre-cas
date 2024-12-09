// src/pages/MyPage/Dashboard.js

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TherapistDashboard from '../../components/Dashboard/Cast/TherapistDashboard';
import GuestDashboard from '../../components/Dashboard/Guest/GuestDashboard';

const Dashboard = () => {
  const { userProfile, loading } = useContext(AuthContext); // loadingを取得
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProfile && !loading) {
      // プロフィールがまだロードされていない、またはnullの場合にログインページへリダイレクト
      navigate('/login');
    }
  }, [userProfile, loading, navigate]);

  if (loading || !userProfile) {
    // プロフィールがまだロードされていない場合はローディング表示
    return <p>ローディング中</p>;
  }

  return (
    <>
      {userProfile.userType === 'THERAPIST' ? (
        <TherapistDashboard />
      ) : userProfile.userType === 'USER' ? (
        <GuestDashboard />
      ) : (
        <p>ローディング中</p>
      )}
    </>
  );
};

export default Dashboard;
