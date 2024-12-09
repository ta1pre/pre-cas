// src/components/imageup/ProfileImageUploader.js

import React from 'react';
import { Badge, Avatar, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ImageUploader from '../common/ImageUploader';

const ProfileImageUploader = ({ userProfile, onUploadSuccess }) => {
  const handleUploadSuccess = (imagePath) => {
    // タイムスタンプを付加してキャッシュを回避
    const updatedImagePath = `${imagePath}?v=${Date.now()}`;
    onUploadSuccess(updatedImagePath);
  };

  return (
    <ImageUploader
      onUploadSuccess={handleUploadSuccess}
      invitationId={userProfile?.userInvitationId}
      aspectRatio={{ width: 200, height: 200 }}
      category="profile"
      subDirectory="header"
      fileNameConfig={{
        'profile/header': () => 'iconimage.jpg',
      }}
    >
      {({ openFileDialog, isUploading }) => (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton 
              color="secondary" 
              aria-label="edit profile picture"
              onClick={() => {
                console.log('IconButton clicked');
                openFileDialog();
              }}
              disabled={isUploading}
            >
              <CameraAltIcon style={{ color: 'white' }} />
            </IconButton>
          }
        >
          <Avatar
            alt={userProfile.displayName}
            src={`${userProfile.pictureUrl}?v=${Date.now()}`}  // タイムスタンプを追加
            sx={{ width: 100, height: 100 }}
          />
        </Badge>
      )}
    </ImageUploader>
  );
};

export default ProfileImageUploader;
