import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Box, FormControl, InputLabel, Select, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

const EditReservationForCast = ({ reservation, onSave, onCancel }) => {
  const { token } = useContext(AuthContext);
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);

  const initialDate = reservation.date ? reservation.date.split('T')[0] : '';
  const initialHour = reservation.date ? reservation.date.split('T')[1].substring(0, 2) : '';
  const initialMinute = reservation.date ? reservation.date.split('T')[1].substring(3, 5) : '';

  const [formData, setFormData] = useState({
    date: initialDate,
    hour: initialHour,
    minute: initialMinute,
    course: reservation.course_id || '',
    selectedTime: reservation.selected_time || '',
    options: reservation.options?.map(option => option.option_id) || [],
    location: reservation.location || '',
    fare: reservation.fare || 100,
    shimei: reservation.shimei || 0,
    cast_reward_points: reservation.cast_reward_points || 0,
  });

  // handleInputChange関数の定義
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  // toggleOptionSelection関数の定義
  const toggleOptionSelection = (optionId) => {
    setFormData(prevFormData => {
      const isSelected = prevFormData.options.includes(optionId);
      const newOptions = isSelected
        ? prevFormData.options.filter(id => id !== optionId)
        : [...prevFormData.options, optionId];

      return { ...prevFormData, options: newOptions };
    });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/cast/${reservation.cast_id}/options`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOptions(response.data.options);
      } catch (error) {
        console.error("オプションデータの取得に失敗しました:", error);
      }
    };

    fetchOptions();
  }, [reservation.cast_id, token]);

  useEffect(() => {
    if (formData.course && options.length > 0) {
      const courseId = formData.course;
      const filtered = options.filter(option => option.option_detail.course_id === courseId);
      setFilteredOptions(filtered);
    }
  }, [formData.course, options]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/resv/courses/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const courses = response.data;
        
        // 選択されたコースに応じて、フィルタリング
        const courseType = formData.course === 1 ? 1 : 2;  // デートなら1、その他なら2
        const selectedCourse = courses.find(course => 
          course.course_type === courseType && course.duration_minutes === formData.selectedTime
        );
        
        if (selectedCourse) {
          // コースが見つかった場合、ポイントとキャスト報酬を設定
          setFormData(prevFormData => ({
            ...prevFormData,
            cost_points: selectedCourse.cost_points,
            cast_reward_points: selectedCourse.cast_reward_points
          }));
        } else {
          console.error("該当するコースが見つかりません。");
        }
      } catch (error) {
        console.error("コースデータの取得に失敗しました:", error);
      }
    };
  
    // コースを取得する
    fetchCourses();
  }, [formData.course, formData.selectedTime, token]);  // コースと時間が変わるたびに実行
  

  const handleSaveChanges = async () => {
    try {
      const fullDateTime = `${formData.date}T${formData.hour}:${formData.minute}:00`;
  
      // 指名料 + コースのキャスト報酬 + 選択されたオプション + 交通費 = cast_reward_points
      const totalCastRewardPoints = 
        (formData.shimei || 0) +  // 指名料
        (formData.cast_reward_points || 0) +  // コースのキャスト報酬
        formData.options.reduce((sum, option_id) => {
          const selectedOption = filteredOptions.find(opt => opt.option_id === option_id);
          return sum + (selectedOption?.option_detail?.price || 0);  // 選択されたオプションの価格合計
        }, 0) +
        (formData.fare || 0);  // 交通費
  
      // 指名料 + コースポイント + 選択されたオプション + 交通費 = total_points
      const totalPoints = 
        (formData.shimei || 0) +  // 指名料
        (formData.cost_points || 0) +  // コースのコストポイント
        formData.options.reduce((sum, option_id) => {
          const selectedOption = filteredOptions.find(opt => opt.option_id === option_id);
          return sum + (selectedOption?.option_detail?.price || 0);  // 選択されたオプションの価格合計
        }, 0) +
        (formData.fare || 0);  // 交通費
  
      const payload = {
        date: fullDateTime,
        location: formData.location,
        status: formData.status || 'confirmed',
        progress_status: formData.progress_status || 'dispatched',
        selected_time: formData.selectedTime,
        cast_reward_points: totalCastRewardPoints,  // キャスト報酬
        total_points: totalPoints,  // トータルポイント
        fare: formData.fare || 0,  // 交通費
        shimei: formData.shimei || 0,  // 指名料
        options: formData.options.map(option_id => ({
          option_id,
          option_price: filteredOptions.find(opt => opt.option_id === option_id).option_detail.price || 0
        }))
      };
  
      console.log("送信するペイロード:", payload);
  
      await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/api/resv/reservations/${reservation.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("予約情報が更新されました！");
      onSave();
    } catch (error) {
      console.error("予約の更新に失敗しました:", error);
      alert("予約の更新に失敗しました。");
    }
  };
  
  
  

  return (
    <Container maxWidth="sm">
      {/* 以下、フォームのコンポーネント */}
      <Typography variant="h4" sx={{ mb: 3 }}>キャスト予約修正</Typography>

      {/* 日付フィールド */}
      <TextField
        fullWidth
        label="予約日"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      {/* 時間フィールド */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="hour-select-label">時間</InputLabel>
          <Select
            labelId="hour-select-label"
            name="hour"
            value={formData.hour}
            onChange={handleInputChange}
            label="時間"
          >
            {[...Array(24).keys()].map(hour => (
              <MenuItem key={hour} value={String(hour).padStart(2, '0')}>
                {String(hour).padStart(2, '0')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="minute-select-label">分</InputLabel>
          <Select
            labelId="minute-select-label"
            name="minute"
            value={formData.minute}
            onChange={handleInputChange}
            label="分"
          >
            <MenuItem value="00">00</MenuItem>
            <MenuItem value="30">30</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* コース（表示のみ） */}
      <TextField
        fullWidth
        label="コース"
        name="course"
        value={formData.course === 1 ? "デート" : formData.course === 2 ? "ヘルス" : "その他"}
        sx={{ mb: 2 }}
        InputProps={{ readOnly: true }} // 読み取り専用に設定
      />

      {/* 時間（選択式） */}
      <TextField
        fullWidth
        select
        label="時間 (分)"
        name="selectedTime"
        value={formData.selectedTime}
        onChange={handleInputChange}
        sx={{ mb: 2 }}
      >
        {[60, 90, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((time) => (
          <MenuItem key={time} value={time}>
            {time} 分
          </MenuItem>
        ))}
      </TextField>

      {/* オプション選択（チェックボックス形式） */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>オプション</Typography>
        {filteredOptions.map((option) => (
          <FormControlLabel
            key={option.option_id}
            control={
              <Checkbox
                checked={formData.options.includes(option.option_id)}
                onChange={() => toggleOptionSelection(option.option_id)}
              />
            }
            label={`${option.option_detail.option_name} (${option.option_detail.price}pt)`}
          />
        ))}
      </Box>

      {/* 場所フィールド */}
      <TextField
        fullWidth
        label="場所"
        name="location"
        value={formData.location}
        onChange={handleInputChange}
        sx={{ mb: 2 }}
      />

      {/* 交通費選択 */}
      <TextField
        fullWidth
        select
        label="交通費"
        name="fare"
        value={formData.fare}
        onChange={handleInputChange}
        sx={{ mb: 2 }}
      >
        <MenuItem value={100}>100円</MenuItem>
        <MenuItem value={200}>200円</MenuItem>
        <MenuItem value={300}>300円</MenuItem>
      </TextField>

      {/* ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>キャンセル</Button>
        <Button variant="contained" color="primary" onClick={handleSaveChanges}>変更を保存</Button>
      </Box>
    </Container>
  );
};

export default EditReservationForCast;
