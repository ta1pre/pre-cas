// /src/components/resv/DateStep.js
import React, { useState, useEffect } from 'react';
import { Button, Box, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { format, addDays } from 'date-fns';

const DateStep = ({ onNext, initialDate, initialTime }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || '');  // 初期値を設定
  const [selectedTime, setSelectedTime] = useState(initialTime || '');  // 初期値を設定
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = addDays(new Date(), i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    setAvailableDates(dates);

    setAvailableTimes(['10:00', '11:00', '12:00', '13:00', '14:00']); 
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleNext = () => {
    // 日付と時間が選択されている場合に次のステップに進む
    if (selectedDate && selectedTime) {
      onNext({ date: selectedDate, time: selectedTime });
    } else {
      alert('日付と時間を選択してください。');
    }
  };

  return (
    <Box>
      <h2>日付を選択</h2>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
        <Button
          variant={selectedDate === availableDates[0] ? 'contained' : 'outlined'}
          onClick={() => handleDateSelect(availableDates[0])}
          sx={{ width: '100%', maxWidth: '300px', fontWeight: 'bold', fontSize: '16px' }}
        >
          本日 ({availableDates[0]})
        </Button>
      </Box>

      <Grid container spacing={1}>
        {availableDates.slice(1).map((date, index) => (
          <Grid item xs={4} key={date}>
            <Button
              variant={selectedDate === date ? 'contained' : 'outlined'}
              onClick={() => handleDateSelect(date)}
              sx={{ width: '100%' }}
            >
              {date}
            </Button>
          </Grid>
        ))}
      </Grid>

      <FormControl fullWidth sx={{ marginTop: 2 }}>
        <InputLabel id="time-select-label">時間を選択</InputLabel>
        <Select
          labelId="time-select-label"
          value={selectedTime}
          onChange={handleTimeSelect}
        >
          {availableTimes.map((time) => (
            <MenuItem key={time} value={time}>
              {time}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleNext} sx={{ marginTop: 2 }}>
        次へ
      </Button>
    </Box>
  );
};

export default DateStep;
