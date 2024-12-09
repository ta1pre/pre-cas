// src/pages/resv/ReservationDetail.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Card, CardContent, Tabs, Tab, TextField } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import getStatusLabel from '../../utils/getStatusLabel';  // ステータス表示関数のインポート
import EditReservationForCast from '../../components/resv/edit/EditReservationForCast';
import Chat from '../../components/resv/chat/Chat';  // インポート追加
import { AuthContext } from '../../context/AuthContext'; // 認証コンテキストをインポート


const ReservationDetail = () => {
  const { userProfile } = useContext(AuthContext);  // AuthContextからuserProfileを取得
  const { resv_id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();  // navigateフックでページ遷移

  const fetchReservationDetail = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/resv/details/${resv_id}`);
      console.log("Fetched reservation details:", response.data);
      setReservation(response.data);
    } catch (error) {
      console.error("Failed to fetch reservation details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationDetail();
  }, [resv_id]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  if (!reservation) {
    return <Typography>予約情報が見つかりません。</Typography>;
  }

  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant="h4" style={{ marginBottom: '20px' }}>
        予約詳細
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="予約詳細" />
        <Tab label="チャット" />
      </Tabs>

      {/* 予約詳細タブ */}
      {tabIndex === 0 && (
        <Box>
          {isEditing ? (
            <EditReservationForCast
              reservation={reservation}
              onSave={() => {
                setIsEditing(false);
                fetchReservationDetail();
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Card style={{ marginBottom: '20px', padding: '20px' }}>
              <CardContent>
                {/* ステータスの日本語表示（キャスト向け） */}
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>進行状況: </strong>{getStatusLabel(reservation.status, 'cast')}
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>日時: </strong>{dayjs(reservation.date).format('YYYY-MM-DD HH:mm')}
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>顧客名: </strong>{reservation.user_name}
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>コース: </strong>{reservation.course_id === 1 ? "デート" : reservation.course_id === 2 ? "ヘルス" : "その他"}: {reservation.selected_time}分
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px', color: 'red' }}>
                  <strong>合計: </strong>{reservation.cast_reward_points}pt
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>場所: </strong>{reservation.location}
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>交通費: </strong>{reservation.fare}円
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  <strong>オプション: </strong>
                  {reservation.options && reservation.options.length > 0 ? (
                    reservation.options.map((option, index) => (
                      <span key={index}>
                        {option.option_name || '未設定'} ({option.option_price}pt)
                        {index < reservation.options.length - 1 && ', '}
                      </span>
                    ))
                  ) : (
                    <span>なし</span>
                  )}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* 予約変更ボタン */}
          {!isEditing && (
            <Button 
              variant="contained" 
              color="primary" 
              style={{ width: '100%', marginBottom: '20px' }}
              onClick={() => setIsEditing(true)}
            >
              予約変更
            </Button>
          )}
        </Box>
      )}

      {/* チャットタブ */}
      {tabIndex === 1 && (
  <Box>
    <Card style={{ marginBottom: '20px', padding: '20px' }}>
      <CardContent>
      <Chat reservationId={resv_id} senderId={userProfile.userInvitationId} senderType="cast" />
      </CardContent>
    </Card>
  </Box>
)}

      {/* 一覧に戻るボタン */}
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={() => navigate('/resvlist')}  // キャストの予約一覧ページに戻る
        style={{ marginTop: '20px', width: '100%' }}
      >
        予約一覧に戻る
      </Button>
    </Box>
  );
};

export default ReservationDetail;
