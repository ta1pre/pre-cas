import React from 'react';
import { Button } from '@mui/material';
import ImageUploader from '../common/ImageUploader';

const CastImageUploader = ({ castId, onUploadSuccess, onCancel, fileName, imageNumber }) => {
    const handleUploadSuccess = (newImagePath) => {
        console.log(`Upload success for image ${imageNumber}. Path: ${newImagePath}`);
        onUploadSuccess(newImagePath);
    };

    const fileNameConfig = {
        default: () => {
            console.log(`Generating fileName: ${fileName}`);
            return fileName;
        }
    };

    const deleteFilePath = `storage/users/${castId}/profile/cast/images/castimage_${imageNumber}.jpg`;

    return (
        <ImageUploader
            onUploadSuccess={handleUploadSuccess}
            invitationId={castId}
            aspectRatio={{ width: 500, height: 800 }}
            category="profile"
            subDirectory="cast/images"
            fileNameConfig={fileNameConfig}
            deleteFilePath={deleteFilePath} // 削除パスを渡す
        >
            {({ openFileDialog, isUploading, handleDelete }) => (
                <div>
                    <Button
                        variant="contained"
                        onClick={openFileDialog}
                        disabled={isUploading}
                    >
                        画像{imageNumber}を選択
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isUploading}
                        style={{ marginLeft: '10px' }}
                    >
                        キャンセル
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleDelete(deleteFilePath)}
                        disabled={isUploading}
                        style={{ marginLeft: '10px' }}
                    >
                        削除
                    </Button>
                    {isUploading && <p>アップロード中...</p>}
                </div>
            )}
        </ImageUploader>
    );
};

export default CastImageUploader;
