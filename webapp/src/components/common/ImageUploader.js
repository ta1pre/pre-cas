// src/components/common/ImageUploader.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadImage, deleteImage } from '../../api/imageAPI';

const ImageUploader = ({ onUploadSuccess, invitationId, aspectRatio, category, subDirectory, fileNameConfig, children, deleteFilePath }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = useCallback((image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg');
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      console.error('Crop not completed or image not loaded');
      return;
    }
  
    try {
    console.log('Starting upload process');
    const originalFileName = 'image.jpg';
    const fileNameFunction = fileNameConfig[`${category}/${subDirectory}`] || 
                             fileNameConfig[category] || 
                             fileNameConfig.default;
    console.log('fileNameFunction: ', fileNameFunction); // デバッグログ追加
    const newFileName = fileNameFunction(originalFileName);
    console.log(`Generated file name: ${newFileName}`);
  
      console.log('Cropping image');
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        newFileName
      );
      
      setIsUploading(true);
      console.log('Uploading image');
      const result = await uploadImage(
        croppedImageBlob,
        category,
        invitationId,
        aspectRatio.width,
        aspectRatio.height,
        subDirectory,
        newFileName
      );
      console.log('Upload successful', result);
      const timestamp = Date.now();
      const imagePath = `${process.env.REACT_APP_BASE_URL}/img/i/${result.path}?v=${timestamp}`;
    
      onUploadSuccess(imagePath);
      setSrc(null);
    } catch (error) {
      console.error('Upload failed:', error.message);
    } finally {
      setIsUploading(false);
    }
  }, [completedCrop, invitationId, aspectRatio, onUploadSuccess, getCroppedImg, category, subDirectory, fileNameConfig]);

  const handleDelete = useCallback(async () => {
    if (!deleteFilePath) {
      console.error('Delete file path not provided');
      return;
    }
    
    try {
      await deleteImage(deleteFilePath);
      // 削除成功後、タイムスタンプ付きの空のパスを返す
      const timestamp = Date.now();
      const emptyImagePath = `${process.env.REACT_APP_BASE_URL}/img/i/sys/noimg.png?v=${timestamp}`;
      onUploadSuccess(emptyImagePath);  // 画像が削除されたことを親コンポーネントに通知
      setSrc(null);
    } catch (error) {
      console.error('Delete failed:', error.message);
    }
  }, [deleteFilePath, onUploadSuccess]);

  const openFileDialog = () => {
    document.getElementById('image-upload-input').click();
  };
  

  return (
    <div>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload-input"
        type="file"
        onChange={onSelectFile}
      />
      {children({ openFileDialog, isUploading, handleDelete })}
      {src && (
        <Dialog open={true} onClose={() => setSrc(null)} maxWidth="md" fullWidth>
          <DialogContent>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio.width / aspectRatio.height}
            >
              <img
                ref={imgRef}
                src={src}
                alt="Crop me"
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </ReactCrop>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSrc(null)}>キャンセル</Button>
            <Button onClick={handleUpload} disabled={isUploading || !completedCrop}>
              {isUploading ? <CircularProgress size={24} /> : 'アップロード'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default ImageUploader;
