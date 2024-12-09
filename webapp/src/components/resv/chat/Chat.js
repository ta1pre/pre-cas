import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, Paper } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs'; // dayjsを使って日付をフォーマット

const Chat = ({ reservationId, senderId, senderType }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageListRef = useRef(null);  // メッセージリストの参照を保持

  // メッセージ取得用
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/resv/chat/${reservationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [reservationId]);

  // メッセージ送信用
  const sendMessage = async () => {
    if (newMessage.trim() === '') return; // 空メッセージは送信しない

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/resv/chat/`, {
        reservation_id: reservationId,
        sender_id: senderId,
        sender_type: senderType,
        message: newMessage,
      });
      setNewMessage(''); // メッセージ送信後にクリア
      fetchMessages(); // 送信後にメッセージを再取得
      scrollToBottom();  // メッセージ送信後にスクロール
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // メッセージリストの末尾に自動スクロール
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();  // メッセージが更新されるたびにスクロール
  }, [messages]);

  // 日付フォーマット (YYYY年MM月DD日 (曜日) HH:mm)
  const formatDateTime = (dateString) => {
    const date = dayjs(dateString);
    return date.format('YYYY年MM月DD日 (ddd) HH:mm');  // 日付と時間を整形
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="flex-start" height="100%" bgcolor="#f5f5f5">
      {/* メッセージリスト */}
      <Box padding="20px">
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} disableGutters>
              <Box
                display="flex"
                flexDirection="column"
                alignItems={message.sender_type === senderType ? 'flex-end' : 'flex-start'}  // 吹き出しを左右寄せ
                mb={2}
                width="100%"  // 幅を全体に
              >
                {/* 日付と時間は常に左寄せ */}
                <Typography variant="caption" color="textSecondary" align="left">
                  {formatDateTime(message.created_at)}  {/* 日付フォーマット適用 */}
                </Typography>

                {/* 吹き出しのメッセージ */}
                <Paper
                  elevation={2}
                  style={{
                    maxWidth: '70%',  // 吹き出しの最大幅を制限
                    padding: '10px 15px',
                    backgroundColor: message.sender_type === senderType ? '#DCF8C6' : '#FFFFFF',
                    borderRadius: message.sender_type === senderType ? '15px 15px 0 15px' : '15px 15px 15px 0',
                    marginTop: '5px',  // 日付とメッセージの間のスペース
                    marginLeft: message.sender_type === senderType ? 'auto' : '0',  // 送信者の吹き出しを右に寄せる
                    marginRight: message.sender_type === senderType ? '0' : 'auto', // 受信者の吹き出しを左に寄せる
                  }}
                >
                  <Typography variant="body2" style={{ wordBreak: 'break-word' }}>
                    {message.message}
                  </Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}
          <div ref={messageListRef} /> {/* 自動スクロール用の参照 */}
        </List>
      </Box>

      {/* メッセージ入力エリア - 画面下部に固定 */}
      <Box
        display="flex"
        alignItems="center"
        padding="10px"
        bgcolor="#FFFFFF"
        borderTop="1px solid #ddd"
        position="fixed"  // 画面下部に固定
        bottom="0"
        left="0"
        right="0"
        zIndex="1000"
      >
        <TextField
          label="メッセージを入力"
          variant="outlined"
          fullWidth
          multiline
          rows={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" color="primary" onClick={sendMessage}>
          送信
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
