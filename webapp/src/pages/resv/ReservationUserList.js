// src/pages/static/ReservationUserList.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import getStatusLabel from '../../utils/getStatusLabel';  // ここでインポート



const ReservationUserList = () => {
  const { userProfile, token } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/resv/list_user/${userProfile.userInvitationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Fetched reservations:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reservations", error);
      throw error;
    }
  };

  useEffect(() => {
    if (userProfile?.type === "USER") {
      const loadReservations = async () => {
        try {
          const data = await fetchReservations();
          setReservations(data || []);
        } catch (error) {
          setError('予約データの取得に失敗しました。');
        } finally {
          setLoading(false);
        }
      };
      loadReservations();
    }
  }, [userProfile, token]);

  if (userProfile?.type !== "USER") {
    return <div>Not Found</div>;
  }

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>予約一覧（ユーザー専用）</h2>
      <Grid container spacing={3}>
        {reservations.length === 0 ? (
          <p>予約がありません。</p>
        ) : (
          reservations.map((reservation) => (
            <Grid item xs={12} key={reservation.id}>
              <Card style={{ marginBottom: '20px', padding: '20px' }}>
                <CardContent>
                  {/* 進行状況 */}
                  <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    進行状況: {getStatusLabel(reservation.status)} {/* ステータスの日本語表示 */}
                  </Typography>

                  {/* 日時 */}
                  <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    {dayjs(reservation.date).format('YYYY年MM月DD日 HH:mm')}
                  </Typography>

                  {/* 場所 */}
                  <Typography variant="body2" style={{ marginBottom: '10px' }}>
                    場所: {reservation.location}
                  </Typography>

                  {/* コース */}
                  <Typography variant="body2" style={{ marginBottom: '10px' }}>
                    コース: {reservation.course_id === 1 ? "デート" : reservation.course_id === 2 ? "ヘルス" : "その他"} ({reservation.selected_time}分)
                  </Typography>

                  {/* お支払いポイント */}
                  <Typography variant="body2" style={{ marginBottom: '20px', color: 'red', fontWeight: 'bold' }}>
                    お支払いポイント: {reservation.total_points}pt
                  </Typography>

                  {/* 詳細ボタン */}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/resv/userdetail/${reservation.id}`)}
                    style={{ width: '100%' }}
                  >
                    詳細
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </div>
  );
};

export default ReservationUserList;