// src/components/schedule/WeeklySchedule.js
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Checkbox, FormControlLabel, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AreaSelector from '../common/AreaSelector';  // エリア選択UI
import axios from 'axios';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ":00");

const WeeklySchedule = ({ castId, onSave }) => {
  const [startDate, setStartDate] = useState('');  // 開始日
  const [weeks, setWeeks] = useState('');  // 期間の初期値はブランク
  const [startHour, setStartHour] = useState('');  // 開始時間
  const [endHour, setEndHour] = useState('');  // 終了時間
  const [daysEnabled, setDaysEnabled] = useState(Array(7).fill(false));  // 曜日ごとのON/OFF
  const [area, setArea] = useState('デフォルト駅');  // 初期状態はデフォルトの駅名
  const [supportArea, setSupportArea] = useState('');  // 駅IDを保持するステート
  const [areaSelectionOpen, setAreaSelectionOpen] = useState(false);  // モーダルの開閉制御

  useEffect(() => {
    // プロフィールから駅IDを取得
  async function fetchProfileArea() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/cast/${castId}/profile`, {
        withCredentials: true
      });

      const profileData = response.data.profile;
      const profileAreaId = profileData.support_area;  // 駅ID（support_area）を取得

      if (profileAreaId) {
        setSupportArea(profileAreaId);  // 駅IDを設定

        // 駅IDから駅名を取得するリクエスト
        const stationResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/area/station_name/${profileAreaId}`);
        setArea(stationResponse.data.station_name);  // 駅名を設定
      } else {
        setArea("エリア選択");
      }

    } catch (error) {
      console.error("プロフィール情報の取得に失敗しました:", error);
      setArea("エリア情報が取得できませんでした");
    }
  }

  fetchProfileArea();
}, [castId]);

  // 開始日のプルダウンオプション（今日から10日先まで）
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i <= 10; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      options.push(futureDate.toISOString().split('T')[0]);
    }
    return options;
  };

  // シフトの保存処理
  const handleSave = async () => {
    const shiftData = [];  // シフトデータを格納する配列
  
    const startDateObj = new Date(startDate);  // 開始日をDateオブジェクトに変換

    // 期間の週数に基づいて日付を生成
    for (let week = 0; week < weeks; week++) {
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDateObj);
            currentDate.setDate(startDateObj.getDate() + week * 7 + day);  // 開始日からのオフセット計算
  
            const dayOfWeek = currentDate.getDay();
  
            if (daysEnabled[dayOfWeek]) {
                shiftData.push({
                    date: currentDate.toISOString().split('T')[0],
                    start_time: startHour,
                    end_time: endHour,
                    station_code: supportArea,
                });
            }
        }
    }

    const payload = {
        cast_id: castId,
        shifts: shiftData,
    };

    try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/cast-schedule/batch-update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status === "success") {
            alert("シフト登録成功しました。");

            // 成功時にブラウザをリロードする
            window.location.reload();  // ブラウザをリロードして、最新のスケジュールを反映
        } else {
            console.error("Error:", result);  // エラー詳細をログに表示
            alert("シフトの保存に失敗しました。");
        }
    } catch (error) {
        console.error("Error saving schedule:", error);
        alert("シフトの保存中にエラーが発生しました。");
    }
};

  // モーダルを開く処理
  const handleOpenAreaSelector = () => {
    setAreaSelectionOpen(true);
  };

  // モーダルを閉じる処理
  const handleCloseAreaSelector = () => {
    setAreaSelectionOpen(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h6">週間シフトの登録</Typography>

      {/* 開始日のプルダウン */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>開始日</InputLabel>
        <Select
          value={startDate}
          label="開始日"
          onChange={(e) => setStartDate(e.target.value)}
          renderValue={(value) => value === "" ? "開始日を選択" : value}
        >
          <MenuItem value="" disabled>開始日を選択</MenuItem>
          {generateDateOptions().map((date) => (
            <MenuItem key={date} value={date}>
              {date}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 期間のプルダウン */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>期間</InputLabel>
        <Select
          value={weeks}
          label="期間"
          onChange={(e) => setWeeks(e.target.value)}
          renderValue={(value) => `${value}週間`}  // 表示は「X週間」にする
        >
          <MenuItem value="" disabled>期間を選択</MenuItem>
          {[1, 2, 3, 4].map(week => (
            <MenuItem key={week} value={week}>{week}週間</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 開始時間 */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>開始時間</InputLabel>
        <Select
          value={startHour}
          label="開始時間"
          onChange={(e) => setStartHour(e.target.value)}
        >
          {hours.map(hour => (
            <MenuItem key={hour} value={hour}>
              {hour}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 終了時間 */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>終了時間</InputLabel>
        <Select
          value={endHour}
          label="終了時間"
          onChange={(e) => setEndHour(e.target.value)}
        >
          {hours.map(hour => (
            <MenuItem key={hour} value={hour}>
              {hour}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
          <FormControlLabel
            key={day}
            control={
              <Checkbox
                checked={daysEnabled[index]}
                onChange={(e) => {
                  const newDays = [...daysEnabled];
                  newDays[index] = e.target.checked;
                  setDaysEnabled(newDays);
                }}
              />
            }
            label={day}
          />
        ))}
      </Box>

      {/* エリア選択の修正部分 */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <TextField
          label="対応駅"
          value={area}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleOpenAreaSelector}  // モーダルを開く
                >
                  変更
                </Button>
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </FormControl>

      {/* AreaSelector モーダルの表示 */}
      <Dialog open={areaSelectionOpen} onClose={handleCloseAreaSelector} fullWidth maxWidth="sm">
        <DialogTitle>エリアを選択してください</DialogTitle>
        <DialogContent>
          <AreaSelector
            onSelect={(stationData) => {
              setArea(stationData.station);  // 選択された駅名を反映
              setSupportArea(stationData.stationId);  // 選択された駅IDを反映
              handleCloseAreaSelector();  // モーダルを閉じる
            }}
            onClose={handleCloseAreaSelector}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAreaSelector} color="primary">
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>

      <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 3 }}>
        シフトを登録
      </Button>
    </Box>
  );
};

export default WeeklySchedule;
