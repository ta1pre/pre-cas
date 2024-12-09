// src/pages/resv/ReservationUserDetail.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Card, CardContent, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import getStatusLabel from '../../utils/getStatusLabel';  // ステータス表示のインポート
import Chat from '../../components/resv/chat/Chat';  // インポート追加
import { AuthContext } from '../../context/AuthContext'; // 認証コンテキストをインポート


const ReservationUserDetail = () => {
  const { userProfile } = useContext(AuthContext);  // AuthContextからuserProfileを取得
  const { resv_id } = useParams();  // URLから予約IDを取得
  const [reservation, setReservation] = useState(null);  // 予約データ
  const [loading, setLoading] = useState(true);  // ローディング状態
  const [tabIndex, setTabIndex] = useState(0);  // タブの選択状態
  const navigate = useNavigate();  // ページ遷移用

  // 予約詳細を取得する関数
  const fetchReservationDetail = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/resv/details/${resv_id}`);
      console.log("Fetched reservation details:", response.data);
      setReservation(response.data);  // 取得した予約データを設定
    } catch (error) {
      console.error("Failed to fetch reservation details", error);
    } finally {
      setLoading(false);  // ローディング終了
    }
  };

  useEffect(() => {
    fetchReservationDetail();  // コンポーネントのマウント時に予約詳細を取得
  }, [resv_id]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);  // タブの選択を変更
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;  // ローディング中の表示
  }

  if (!reservation) {
    return <Typography>予約情報が見つかりません。</Typography>;  // 予約データが見つからない場合
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
          <Card style={{ marginBottom: '20px', padding: '20px' }}>
            <CardContent>
              {/* ステータスの日本語表示 */}
              <Typography variant="body1" style={{ marginBottom: '10px' }}>
                <strong>進行状況: </strong>{getStatusLabel(reservation.status)}
              </Typography>
              
              {/* 日時 */}
              <Typography variant="body1" style={{ marginBottom: '10px' }}>
                <strong>日時: </strong>{dayjs(reservation.date).format('YYYY-MM-DD HH:mm')}
              </Typography>
              
              {/* 場所 */}
              <Typography variant="body1" style={{ marginBottom: '10px' }}>
                <strong>場所: </strong>{reservation.location}
              </Typography>

              {/* コース */}
              <Typography variant="body1" style={{ marginBottom: '10px' }}>
                <strong>コース: </strong>{reservation.course_id === 1 ? "デート" : reservation.course_id === 2 ? "ヘルス" : "その他"}: {reservation.selected_time}分
              </Typography>

              {/* お支払いポイント */}
              <Typography variant="body1" style={{ marginBottom: '10px', color: 'red' }}>
                <strong>お支払いポイント: </strong>{reservation.total_points}pt
              </Typography>

              {/* 交通費 */}
              <Typography variant="body1" style={{ marginBottom: '10px' }}>
                <strong>交通費: </strong>{reservation.fare}円
              </Typography>

              {/* オプション */}
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
        </Box>
      )}

      {/* チャットタブ */}
      {tabIndex === 1 && (
  <Box>
    <Card style={{ marginBottom: '20px', padding: '20px' }}>
      <CardContent>
      <Chat reservationId={resv_id} senderId={userProfile.userInvitationId} senderType="user" />
      </CardContent>
    </Card>
  </Box>
)}

      {/* 一覧に戻るボタン */}
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={() => navigate('/resvuserlist')}  // 一覧ページに戻る
        style={{ marginTop: '20px', width: '100%' }}
      >
        一覧に戻る
      </Button>
    </Box>
  );
};

export default ReservationUserDetail;
