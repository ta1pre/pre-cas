// OptionStep.js
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Modal, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const OptionStep = ({ onNext, onPrevious, selectedCourse, initialOption = [], castId }) => {
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(initialOption);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});

  useEffect(() => {
    // サーバーからすべてのオプションを取得
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/cast/${castId}/options`);
        if (response.data && response.data.options) {
          setOptions(response.data.options);
        }
      } catch (error) {
        console.error('オプションデータの取得に失敗しました:', error);
      }
    };

    fetchOptions();
  }, [castId]);

  useEffect(() => {
    if (selectedCourse && options.length > 0) {
      const courseId = selectedCourse === 'デート' ? 1 : 2;
      const filtered = options.filter(option => option.option_detail.course_id === courseId);
      setFilteredOptions(filtered);
    }
  }, [selectedCourse, options]);

  useEffect(() => {
    setSelectedOptions(initialOption);
  }, [initialOption]);

  const handleOpenModal = (option) => {
    setModalContent({
      name: option.option_detail.option_name,
      description: option.option_detail.description,
      price: option.option_detail.price,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const toggleOptionSelection = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.some(selected => selected.id === option.option_id)
        ? prevSelected.filter(selected => selected.id !== option.option_id)  // すでに選択されている場合は削除
        : [...prevSelected, { id: option.option_id, name: option.option_detail.option_name, price: option.option_detail.price }]  // id, name, priceを追加
    );
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 2, overflowX: 'hidden' }}>
      <Typography variant="h6" gutterBottom>オプションを選択してください</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, marginBottom: 3 }}>
        {filteredOptions.map((option) => (
          <Box key={option.id} sx={{ position: 'relative' }}>
            <Button
              variant={selectedOptions.some(selected => selected.id === option.option_id) ? 'contained' : 'outlined'}
              onClick={() => toggleOptionSelection(option)}
              sx={{ width: '100%', padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              {option.option_detail.option_name}
              <IconButton onClick={() => handleOpenModal(option)} sx={{ marginLeft: 1 }}>
                <HelpOutlineIcon />
              </IconButton>
            </Button>
          </Box>
        ))}
      </Box>

      {/* モーダルの実装 */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="option-description-title"
        aria-describedby="option-description-content"
      >
        <Box sx={{ width: 300, backgroundColor: 'white', padding: 4, margin: 'auto', marginTop: '20%', borderRadius: 2 }}>
          <Typography id="option-description-title" variant="h6" gutterBottom>{modalContent.name}</Typography>
          <Typography id="option-description-content" variant="body1" gutterBottom>{modalContent.description}</Typography>
          <Typography variant="body2" color="textSecondary">使用ポイント: ¥{modalContent.price}</Typography>
          <Button onClick={handleCloseModal} variant="contained" sx={{ marginTop: 2 }}>閉じる</Button>
        </Box>
      </Modal>

      {/* ナビゲーションボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <Button onClick={onPrevious} variant="outlined">← 戻る</Button>
        <Button 
          onClick={() => {
            console.log("選択されたオプション:", selectedOptions);
            onNext({ options: selectedOptions });  // オプション（id, name, price）を親コンポーネントに渡す
          }} 
          variant="contained">
          次へ →
        </Button>
      </Box>
    </Container>
  );
};

export default OptionStep;
