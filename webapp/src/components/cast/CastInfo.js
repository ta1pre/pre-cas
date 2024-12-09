import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

const CastInfo = ({ castId, onCastInfoRetrieved }) => {
  const [castName, setCastName] = useState('');
  const [selectionFee, setSelectionFee] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchCastInfo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/cast/${castId}/profile`, {
          withCredentials: true
        });
        const profileData = response.data.profile;
        setCastName(profileData.name);
        setSelectionFee(profileData.selection_fee); // 指名料を取得

        // キャスト名と指名料を親コンポーネントに渡す
        if (onCastInfoRetrieved) {
          onCastInfoRetrieved({ name: profileData.name, selection_fee: profileData.selection_fee });
        }
      } catch (err) {
        setFetchError('キャスト情報の取得に失敗しました。');
        console.error('Error:', err);
      }
    };

    fetchCastInfo();
  }, [castId]);  // castId のみを依存配列にする

  return (
    <>
     
    </>
  );
};

export default CastInfo;
