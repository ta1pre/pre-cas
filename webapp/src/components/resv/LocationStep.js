import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Typography, Button } from '@mui/material';

const LocationStep = ({ onNext, onPrevious, initialLocation }) => {
  // 初期値として受け取った場所を設定
  const [location, setLocation] = useState(initialLocation || ''); 

  // ステップが戻ったときに初期値を再設定
  useEffect(() => {
    setLocation(initialLocation); 
  }, [initialLocation]);

  const handleNext = () => {
    if (location.trim()) {
      // 場所が入力されていれば次のステップへ
      onNext({ location });
    } else {
      alert("場所を入力してください。");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 2, overflowX: 'hidden' }}>
      <Typography variant="h6" gutterBottom>場所を入力してください</Typography>
      <Box sx={{ marginBottom: 3 }}>
        <TextField
          fullWidth
          label="場所"
          placeholder="場所を入力してください"
          variant="outlined"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ marginTop: 2 }}
        />
      </Box>

      {/* ナビゲーションボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <Button onClick={onPrevious} variant="outlined">← 戻る</Button>
        <Button onClick={handleNext} variant="contained">次へ →</Button>
      </Box>
    </Container>
  );
};

export default LocationStep;
