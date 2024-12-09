// src/components/schedule/CastSchedule.js
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.contrastText,
  zIndex: 3,
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  textAlign: 'center',
  padding: '12px 6px',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const CornerTableCell = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  left: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 4,
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  borderBottom: `2px solid ${theme.palette.divider}`,
  borderRight: `2px solid ${theme.palette.divider}`,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: 'nowrap',
  padding: '8px 6px',
  textAlign: 'center',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const StickyLeftTableCell = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 2,
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  borderRight: `2px solid ${theme.palette.divider}`,
  padding: '8px 12px',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CastSchedule = () => {
  const [apiData, setApiData] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/cast-schedule/get-week-schedule/1GjlHBin`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
    setWeekDates(getNextWeekDates());
  }, []);

  const getNextWeekDates = () => {
      const dates = [];
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek;
      const sunday = new Date(today.getFullYear(), today.getMonth(), diff);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        dates.push(formatDate(date));
      }
      return dates;
  };

  const formatDate = (date) => {
      const d = new Date(date);
      d.setHours(d.getHours() + 9);  // JST対応
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  };

  const isAvailable = (dateString, hour) => {
      if (!apiData) return false;
      const schedule = apiData.find(s => s.date === dateString);
      if (!schedule) return false;

      const startHour = parseInt(schedule.start_time.split(':')[0]);
      const endHour = parseInt(schedule.end_time.split(':')[0]);
      const currentHour = parseInt(hour);

      const adjustedEndHour = endHour === 0 ? 24 : endHour;

      return schedule.is_available && currentHour >= startHour && currentHour < adjustedEndHour;
  };

  // デバッグ情報を生成
  const debugInfo = weekDates.map(dateString => ({
      date: dateString,
      day: days[new Date(dateString).getDay()],
      apiData: apiData ? apiData.find(s => s.date === dateString) : null
  }));

  return (
    <>
      <TableContainer component={Paper} style={{ maxHeight: '70vh', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <CornerTableCell>日付</CornerTableCell>
              {hours.map((hour, hourIndex) => (
                <HeaderTableCell
                  key={hourIndex}
                  style={{ minWidth: isMobile ? '40px' : '80px' }}
                >
                  {hour}
                </HeaderTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weekDates.map((dateString, dateIndex) => {
              const displayDate = new Date(dateString);
              displayDate.setDate(displayDate.getDate());  // 表示用に1日前の日付を使用
              return (
                <StyledTableRow key={dateIndex}>
                    <StickyLeftTableCell>
                        {`${displayDate.getMonth() + 1}/${displayDate.getDate()}(${days[displayDate.getDay()]})`}
                    </StickyLeftTableCell>
                  {hours.map((hour, hourIndex) => (
                    <StyledTableCell
                      key={`${dateIndex}-${hourIndex}`}
                      style={{
                        minWidth: isMobile ? '40px' : '80px',
                        backgroundColor: isAvailable(dateString, hour) ? '#e6f7ff' : 'inherit',
                        color: isAvailable(dateString, hour) ? '#1890ff' : 'inherit',
                      }}
                    >
                      {isAvailable(dateString, hour) ? '◯' : ''}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
        <h3>クライアント側の日付処理結果:</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <h3>API Response:</h3>
        <pre>{apiData ? JSON.stringify(apiData, null, 2) : 'Loading...'}</pre>
      </div>
    </>
  );
};

export default CastSchedule;