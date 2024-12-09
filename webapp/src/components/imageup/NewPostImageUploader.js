// src/components/imageup/NewPostImageUploader.js
import React from 'react';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import ImageUploader from '../common/ImageUploader';

const NewPostImageUploader = ({ castId, onUploadSuccess }) => {
  const handleUploadSuccess = (imagePath) => {
    onUploadSuccess(imagePath);  // 親コンポーネントへ画像URLを通知
  };

  const uniqueFileName = "temp_image.jpg";  // 一意なファイル名

  return (
    <ImageUploader
      onUploadSuccess={handleUploadSuccess}
      invitationId={castId}
      aspectRatio={{ width: 500, height: 500 }}  // 正方形のアスペクト比
      category="blog"
      subDirectory="temp"  // castId/blog フォルダに変更
      fileNameConfig={{
        'blog': () => uniqueFileName,  // ファイル名を指定
        default: () => uniqueFileName, // 他のパスの場合でも同じファイル名形式
      }}
    >
      {({ openFileDialog, isUploading }) => (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Button
            variant="contained"
            onClick={openFileDialog}
            disabled={isUploading}
          >
            画像を選択
          </Button>
          {isUploading && <p>アップロード中...</p>}
        </div>
      )}
    </ImageUploader>
  );
};

export default NewPostImageUploader;
