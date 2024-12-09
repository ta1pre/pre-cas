// src/components/cast/CastProfileImage.js

import React, { useState, useCallback } from 'react';
import { Button, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CastImageUploader from '../imageup/CastImageUploader';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const CastProfileImage = ({ castId, onCancel }) => {
    const [activeUploader, setActiveUploader] = useState(null);
    const [uploadedImages, setUploadedImages] = useState({
        1: null,
        2: null,
        3: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // 既存の関数を維持

    const getImageUrl = (imageNumber) => {
        return `${BASE_URL}/img/i/${castId}/profile/cast/images/castimage_${imageNumber}.jpg`;
    };

    const handleUploadClick = (imageNumber) => {
        setActiveUploader(imageNumber);
    };

    const handleUploadSuccess = useCallback((imageNumber, newImagePath) => {
        setUploadedImages(prev => ({
            ...prev,
            [imageNumber]: newImagePath
        }));
        setActiveUploader(null);
        setPreviewImage(null);
        setIsUploading(false);
    }, []);

    const handleFileSelect = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
            setIsUploading(true);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadStart = () => {
        setIsUploading(true);
    };

    return (
        <div style={{ marginTop: '64px' }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onCancel}
                style={{ marginBottom: '16px' }}
            >
                プロフィール編集に戻る
            </Button>
            <Grid container spacing={2} justifyContent="center">
                {[1, 2, 3].map(imageNumber => (
                    <Grid item xs={12} sm={6} md={4} key={imageNumber}>
                        <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                画像 {imageNumber}
                            </Typography>
                            <div style={{ position: 'relative', minHeight: '200px' }}>
                                {isUploading && activeUploader === imageNumber ? (
                                    <>
                                        <img 
                                            src={previewImage || getImageUrl(imageNumber)}
                                            alt={`Cast ${imageNumber}`} 
                                            style={{ width: '100%', height: '200px', objectFit: 'cover', opacity: '0.5' }} 
                                        />
                                        <CircularProgress 
                                            style={{ 
                                                position: 'absolute', 
                                                top: '50%', 
                                                left: '50%', 
                                                marginTop: '-20px', 
                                                marginLeft: '-20px' 
                                            }} 
                                        />
                                    </>
                                ) : (
                                    <img 
                                        src={uploadedImages[imageNumber] || getImageUrl(imageNumber)}
                                        alt={`Cast ${imageNumber}`} 
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `${BASE_URL}/img/i/sys/noimg.png`;
                                        }}
                                    />
                                )}
                                <Button
                                    variant="contained"
                                    startIcon={<AddPhotoAlternateIcon />}
                                    onClick={() => handleUploadClick(imageNumber)}
                                    style={{ position: 'absolute', bottom: '8px', right: '8px' }}
                                    disabled={isUploading}
                                >
                                    {uploadedImages[imageNumber] ? '変更' : 'アップロード'}
                                </Button>
                            </div>
                            {activeUploader === imageNumber && (
                                <CastImageUploader 
                                    castId={castId}
                                    onUploadSuccess={(newImagePath) => handleUploadSuccess(imageNumber, newImagePath)}
                                    onCancel={() => {
                                        setActiveUploader(null);
                                        setPreviewImage(null);
                                        setIsUploading(false);
                                    }}
                                    fileName={`castimage_${imageNumber}.jpg`}
                                    imageNumber={imageNumber}
                                    autoOpenFileDialog={true}
                                    onFileSelect={handleFileSelect}
                                    onUploadStart={handleUploadStart}
                                />
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default CastProfileImage;