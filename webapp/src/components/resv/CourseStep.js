import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Modal, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const CourseStep = ({ updateData, onNext, onPrevious, initialCourse, initialTime }) => {
  const [coursesA, setCoursesA] = useState([]);
  const [coursesB, setCoursesB] = useState([]);
  const [selectedCourseType, setSelectedCourseType] = useState(initialCourse || null);  // 初期値をnullに変更
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTime, setSelectedTime] = useState(initialTime || null);  // 初期値をnullに変更
  const [customHours, setCustomHours] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/resv/courses/`);
        const data = response.data;

        setCoursesA(data.filter(course => course.course_type === 1));
        setCoursesB(data.filter(course => course.course_type === 2));

        console.log("APIから取得したデータ:", data);

        
      } catch (error) {
        console.error('コースデータの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    // データが読み込まれた後に、初期コースと時間を選択
    if (!isLoading && coursesA.length > 0) {
      setTimeout(() => {
        // initialCourse が存在する場合、それを選択
        if (initialCourse) {
          handleCourseTypeSelect(initialCourse, "説明文", true);  // 時間の自動選択をスキップ
        } else {
          handleCourseTypeSelect('デート', "説明文", true);  // デフォルトでデートを選択
        }
  
        // initialTime が存在する場合、その時間を自動的に選択
        if (initialTime && coursesA.some(course => `${course.duration_minutes}分` === initialTime)) {
          setSelectedTime(initialTime);  // 保存されている時間を反映
        }
      }, 100);  // 1秒後に実行
    }
  }, [isLoading, coursesA]);
  

  const handleCourseTypeSelect = (courseType, courseDescription, skipTimeSelection = false) => {
    setSelectedCourseType(courseType);
    setDescription(courseDescription);
  
    const filtered = (courseType === 'デート' ? coursesA : coursesB)
      .filter(course => course.is_active && course.duration_minutes <= 240)
      .sort((a, b) => a.duration_minutes - b.duration_minutes);
  
    console.log("フィルタされた時間データ:", filtered);
  
    setFilteredCourses(filtered);
  
    // 時間の自動選択をスキップするか確認
    if (!skipTimeSelection && filtered.length > 0) {
      handleTimeSelect(filtered[0]);  // デフォルトの時間を選択
    }
  };
  

  const handleTimeSelect = (course) => {
    setSelectedTime(`${course.duration_minutes}分`);  // コース時間を選択
    updateData({
      course: course.course_name,
      courseType: selectedCourseType,
      selectedTime: course.duration_minutes,  // コース時間を保存
      coursePoints: course.cost_points,       // コースのポイントを保存
    });
  };
  
  

  // 任意の時間を選択したときの処理
  const handleCustomHoursChange = (hours) => {
    setCustomHours(hours);
    setSelectedTime(`${hours * 60}分`);
  };

  const handleNext = () => {
    if (selectedCourseType && selectedTime) {
      onNext();
    } else {
      alert("コースと時間を選択してください。");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>コースを選択してください</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 3 }}>
        <Button
          variant={selectedCourseType === 'デート' ? 'contained' : 'outlined'}
          onClick={() => handleCourseTypeSelect('デート', 'デートコースの説明')}
          sx={{ padding: 2, minWidth: '100px', fontWeight: 'bold' }}
        >
          デート
        </Button>
        <Button
          variant={selectedCourseType === 'デリヘル' ? 'contained' : 'outlined'}
          onClick={() => handleCourseTypeSelect('デリヘル', 'デリヘルコースの説明')}
          sx={{ padding: 2, minWidth: '100px', fontWeight: 'bold' }}
        >
          プレミア
        </Button>
      </Box>

      {isLoading ? (
        <Typography variant="body2" color="textSecondary">データを読み込み中...</Typography>
      ) : filteredCourses.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>時間を選択してください</Typography>
<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 3 }}>
  {filteredCourses.map((course) => (
    <Card
      key={course.id}
      sx={{
        cursor: 'pointer',
        // selectedTime を数値として比較
        border: parseInt(selectedTime) === course.duration_minutes ? '2px solid #ff4081' : '1px solid #ccc',
        padding: 2,
        backgroundColor: parseInt(selectedTime) === course.duration_minutes ? '#ffe6f1' : '#fff',
        textAlign: 'center'
      }}
      onClick={() => handleTimeSelect(course)}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>{course.duration_minutes}分</Typography>
        <Typography variant="body2" color="textSecondary">{course.cost_points}pt</Typography>
      </CardContent>
    </Card>
  ))}

  <Card
    sx={{
      cursor: 'pointer',
      border: parseInt(selectedTime) === customHours * 60 ? '2px solid #ff4081' : '1px solid #ccc',
      padding: 2,
      backgroundColor: parseInt(selectedTime) === customHours * 60 ? '#ffe6f1' : '#fff',
      textAlign: 'center'
    }}
    onClick={() => setIsModalOpen(true)}
  >
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {customHours ? `${customHours * 60}分` : '任意'}
      </Typography>
      {customHours && (
        <Typography variant="body2" color="textSecondary">
          {Math.round(customHours * 60 * (filteredCourses[0]?.cost_points / filteredCourses[0]?.duration_minutes))}pt
        </Typography>
      )}
    </CardContent>
  </Card>
</Box>

        </>
      ) : (
        <Typography variant="body2" color="textSecondary">
          コースを選択してください。
        </Typography>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{
          width: 300,
          backgroundColor: '#fff',
          padding: 4,
          margin: 'auto',
          marginTop: '20%',
          borderRadius: 2,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom>任意の時間を選択</Typography>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>時間を選択</InputLabel>
            <Select value={customHours} onChange={(e) => handleCustomHoursChange(e.target.value)}>
              {[...Array(6).keys()].map(i => (
                <MenuItem key={i + 5} value={i + 5}>
                  {i + 5}時間
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Modal>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <Button onClick={onPrevious} variant="outlined">← 戻る</Button>
        <Button onClick={handleNext} variant="contained">次へ →</Button>
      </Box>
    </Container>
  );
};

export default CourseStep;
