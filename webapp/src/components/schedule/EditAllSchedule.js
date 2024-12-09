import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Grid,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import DateDetailModal from './DateDetailModal';
import WeeklySchedule from './WeeklySchedule';  

const EditAllSchedule = ({ castId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const stationName = "Station"; // ここでstationNameを定義

  useEffect(() => {
    fetchSchedules();
}, [castId, currentMonth]);

  const fetchSchedules = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/cast-schedule/get-by-cast/${castId}?timestamp=${new Date().getTime()}`, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch schedules');
        }
        const data = await response.json();
        setSchedules(data);
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const year = prevMonth.getUTCFullYear();
      const month = prevMonth.getUTCMonth() - 1;
      return new Date(Date.UTC(year, month, 1));
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const year = prevMonth.getUTCFullYear();
      const month = prevMonth.getUTCMonth() + 1;
      return new Date(Date.UTC(year, month, 1));
    });
  };

  const handleDateClick = (date, schedule) => {
    setSelectedDate({ date, schedule });
    setModalOpen(true);
  };

  // EditAllSchedule.js

  const onSaveSchedule = async (newSchedule) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/cast-schedule/update-or-create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSchedule),
        });

        if (!response.ok) {
            throw new Error('Failed to save schedule');
        }

        console.log("New schedule added:", newSchedule);

        // 新しいスケジュールで状態を直接更新
        setSchedules(prevSchedules => {
            const updatedSchedules = prevSchedules.filter(s => s.date !== newSchedule.date);
            return [...updatedSchedules, newSchedule];
        });

        // モーダルを閉じる
        setModalOpen(false);
        setSelectedDate(null);

    } catch (error) {
        console.error('Error saving schedule:', error);
    }
};

const onDeleteSchedule = (deletedDate) => {
  setSchedules(prevSchedules => 
      prevSchedules.filter(s => s.date !== deletedDate.toISOString().split('T')[0])
  );
};

const onSaveWeeklySchedule = async () => {
  try {
    // 最新のスケジュールを再取得して、カレンダーを更新
    await fetchSchedules();
  } catch (error) {
    console.error('Error fetching schedules after saving weekly schedule:', error);
  }
};

const renderCalendar = () => {
  const year = currentMonth.getUTCFullYear();
  const month = currentMonth.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = [];

  console.log("Rendering calendar with schedules:", schedules); // デバッグ用ログ

  for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<Grid item key={`empty-${i}`} xs={1.7}></Grid>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateString = date.toISOString().split('T')[0];
      const schedule = schedules.find(s => s.date === dateString);

      days.push(
          <Grid item key={day} xs={1.7}>
              <Paper 
                  elevation={3} 
                  sx={{
                      height: 60, 
                      display: 'flex', 
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: schedule ? '#fba6ff' : 'white',
                      '&:hover': {
                          backgroundColor: '#fde0ff',
                          cursor: 'pointer'
                      }
                  }}
                  onClick={() => handleDateClick(date, schedule)}
              >
                  <Typography variant="body2">{day}</Typography>
              </Paper>
          </Grid>
      );
  }
  return days;
};



  return (
    <Box sx={{ overflowX: 'hidden', paddingBottom: '20px' }}>  {/* 下に余白を追加 */}
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
    <IconButton onClick={handlePreviousMonth}>
      <ChevronLeft />
    </IconButton>
    <Typography variant="h6">
      {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
    </Typography>
    <IconButton onClick={handleNextMonth}>
      <ChevronRight />
    </IconButton>
  </Box>
  <Grid container spacing={1} sx={{ width: '100%', margin: 0 }}>
    {['日', '月', '火', '水', '木', '金', '土'].map(day => (
      <Grid item key={day} xs={1.7}>
        <Typography align="center">{day}</Typography>
      </Grid>
    ))}
    {renderCalendar()}
  </Grid>
  {/* WeeklySchedule コンポーネントの追加 */}
<WeeklySchedule 
  castId={castId} 
  onSave={onSaveWeeklySchedule}  // 既存の onSaveSchedule 関数を利用して、シフト登録
/>

  <DateDetailModal 
    open={modalOpen && selectedDate !== null} 
    onClose={() => {
      setModalOpen(false);
      setSelectedDate(null);
    }} 
    date={selectedDate?.date} 
    schedule={selectedDate?.schedule}
    castId={castId}
    stationName={stationName}  
    onSaveSchedule={onSaveSchedule}
    onDeleteSchedule={onDeleteSchedule}
  />
</Box>
  );
};

export default EditAllSchedule;
