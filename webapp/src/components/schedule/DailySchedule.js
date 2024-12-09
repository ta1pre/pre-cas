//src/components/schedule/DailySchedule.js

import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, TextField, InputAdornment, Link } from '@mui/material';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

const DailySchedule = ({ castId, stationName, supportArea, onSave, initialDate, initialStartTime, initialEndTime, onStationChange }) => {
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialStartTime) setStartHour(initialStartTime.split(':')[0]);
    if (initialEndTime) setEndHour(initialEndTime.split(':')[0]);
  }, [initialStartTime, initialEndTime]);

  const handleInternalSave = () => {
    if (startHour !== '' && endHour !== '') {
      const scheduleData = {
        cast_id: castId,
        date: initialDate.toISOString().split('T')[0],
        start_time: `${startHour}:00:00`,
        end_time: `${endHour}:00:00`,
        station_code: supportArea,  // 駅IDを送信
      };

      if (typeof onSave === 'function') {
        onSave(scheduleData);  // データを送信
      } else {
        console.error("Error: onSave is not a function");
      }
    } else {
      setError('開始時間と終了時間を設定してください。');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialDate ? initialDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : '日付不明'}のシフト
      </Typography>

      <FormControl fullWidth>
        <InputLabel>開始時間</InputLabel>
        <Select
          value={startHour}
          label="開始時間"
          onChange={(e) => setStartHour(e.target.value)}
        >
          {hours.map((hour) => (
            <MenuItem key={hour} value={hour}>
              {hour}:00
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>終了時間</InputLabel>
        <Select
          value={endHour}
          label="終了時間"
          onChange={(e) => setEndHour(e.target.value)}
        >
          {hours.map((hour) => (
            <MenuItem key={hour} value={hour}>
              {hour}:00
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="対応駅"
        value={stationName || '駅情報がありません'}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Link
                component="button"
                variant="body2"
                onClick={onStationChange}  // プロップスで渡された関数を使用
              >
                変更
              </Link>
            </InputAdornment>
          ),
        }}
        fullWidth
        margin="normal"
      />

      {error && <Typography color="error">{error}</Typography>}

      <Button 
        variant="contained" 
        onClick={handleInternalSave} 
        disabled={startHour === '' || endHour === ''}
        fullWidth
      >
        シフトを登録
      </Button>
    </Box>
  );
};

export default DailySchedule;
