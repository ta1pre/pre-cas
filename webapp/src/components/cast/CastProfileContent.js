// src/components/cast/CastProfileContent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Button, Box } from '@mui/material';
import CastProfileEdit from './CastProfileEdit';
import CastProfileImage from './CastProfileImage';
import SuccessNotification from '../common/SuccessNotification';
import ProfileViewer from './ProfileViewer';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

const CastProfileContent = ({ castId, isOwner, isActive, loading }) => {
    const [profile, setProfile] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/cast/${castId}/profile`, {
                withCredentials: true
            });
            setProfile(response.data.profile);
        } catch (err) {
            setFetchError('Failed to fetch cast profile');
            console.error('Error:', err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [castId]);

    const handleEdit = () => setIsEditing(true);
    const handleImageEdit = () => setIsEditingImage(true);

    const handleSave = async (updatedProfile) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/cast/${castId}/update`, updatedProfile, {
                withCredentials: true
            });
            if (response.data.message === "Cast profile updated successfully") {
                setProfile(response.data.profile);
                setIsEditing(false);
                setShowNotification(true);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            setError(error.response ? `Error: ${error.response.status} - ${JSON.stringify(error.response.data)}` : `Error: ${error.message}`);
        }
    };

    const handleCancel = () => setIsEditing(false);
    const handleImageEditCancel = () => setIsEditingImage(false);

    // アップロード成功後にプロフィール画像を再読み込み
    const handleUploadSuccess = () => {
        fetchProfile();  // プロフィールを再取得して反映
        setIsEditingImage(false);
    };

    const handleCloseNotification = (event, reason) => {
        if (reason !== 'clickaway') setShowNotification(false);
    };

    if (loading) return <div>Loading...</div>;
    if (error || fetchError) return <div>Error: {error || fetchError}</div>;
    if (!profile) return <div>No profile found</div>;

    return (
        <Box sx={{ marginTop: '0px' }}>
            
            {error && <Typography color="error">{error}</Typography>}

            {!isEditing && !isEditingImage ? (
                <>
                    <ProfileViewer profile={profile} castId={castId} /> {/* ProfileViewer に castId を渡す */}
                    {isOwner && (
                        <Box>
                            <Button variant="outlined" onClick={handleEdit}>
                                プロフィール編集
                            </Button>
                            <Button variant="outlined" onClick={handleImageEdit} style={{ marginLeft: '10px' }}>
                                プロフィール画像アップ
                            </Button>
                        </Box>
                    )}
                </>
            ) : isEditing ? (
                <CastProfileEdit profile={profile} onSave={handleSave} onCancel={handleCancel} />
            ) : (
                <CastProfileImage
                    castId={castId}
                    onCancel={handleImageEditCancel}
                    onUploadSuccess={handleUploadSuccess}  // 成功後のコールバック
                />
            )}

            <SuccessNotification
                open={showNotification}
                message="Profile updated successfully!"
                onClose={handleCloseNotification}
            />
        </Box>
    );
};

export default CastProfileContent;
