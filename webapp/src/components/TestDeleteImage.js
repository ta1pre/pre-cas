// src/components/TestDeleteImage.js
import React, { useState } from 'react';
import { deleteImage } from '../api/imageAPI';
import { Button, TextField, Typography } from '@mui/material';

const TestDeleteImage = () => {
  const [filePath, setFilePath] = useState('storage/users/');
  const [response, setResponse] = useState('');

  const handleDelete = async () => {
    try {
      const result = await deleteImage(filePath);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error.response) {
        setResponse(`Error: ${error.response.status} ${error.response.statusText}\n${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        setResponse(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6">画像削除テスト</Typography>
      <TextField
        label="File Path"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDelete}
      >
        Delete Image
      </Button>
      {response && (
        <pre style={{ marginTop: '20px', backgroundColor: '#f5f5f5', padding: '10px' }}>
          {response}
        </pre>
      )}
    </div>
  );
};

export default TestDeleteImage;
