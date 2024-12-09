// src/pages/static/ReservationList.js
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; 
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import getStatusLabel from '../../utils/getStatusLabel';  // ステータス表示関数のインポート

const ReservationList = () => {
  const { userProfile } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/resv/list_cast/${userProfile.userInvitationId}`);
      console.log("Fetched reservations:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reservations", error);
      throw error;
    }
  };

  useEffect(() => {
    if (userProfile?.type === "THERAPIST") {
      const loadReservations = async () => {
        try {
          const data = await fetchReservations();
          setReservations(data || []);
        } catch (error) {
          setReservations([]);
        }
      };
      loadReservations();
    }
  }, [userProfile?.type, userProfile?.userInvitationId]);

  if (userProfile?.type !== "THERAPIST") {
    return <div>Not Found</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>予約一覧</h2>
      <Grid container spacing={3}>
        {reservations.length === 0 ? (
          <p>予約がありません。</p>
        ) : (
          reservations.map((reservation) => (
            <Grid item xs={12} key={reservation.id}>
              <Card
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  margin: '10px 0',
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                {/* 進行状況: キャスト用のステータス表示 */}
                <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  進行状況: {getStatusLabel(reservation.status, 'cast')}
                </Typography>

                {/* 日時 */}
                <Typography variant="h6" style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '15px' }}>
                  {dayjs(reservation.date).format('YYYY年MM月DD日 HH:mm')}
                </Typography>

                {/* 顧客名 */}
                <Typography variant="body2" style={{ marginBottom: '10px' }}>
                  顧客名: {reservation.user_name}
                </Typography>

                {/* コース、時間、ポイント */}
                <Typography variant="body2" style={{ marginBottom: '10px' }}>
                  {reservation.course_id === 1 ? "デート" : reservation.course_id === 2 ? "ヘルス" : "その他"}: {reservation.selected_time}分 | <span style={{ color: 'red', fontWeight: 'bold' }}>合計: {reservation.cast_reward_points}pt</span>
                </Typography>

                {/* 場所 */}
                <Typography variant="body2" style={{ color: 'gray', marginBottom: '15px' }}>
                  場所: {reservation.location}
                </Typography>

                {/* 詳細ボタン */}
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate(`/resv/detail/${reservation.id}`)}
                  style={{ width: '100%' }}
                >
                  詳細
                </Button>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </div>
  );
};

export default ReservationList;
