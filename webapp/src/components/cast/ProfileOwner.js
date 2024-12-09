// src/components/cast/ProfileOwner.js
import React, { useState } from 'react';
import { Button } from '@mui/material';
import ProfileViewer from './ProfileViewer';
import CastProfileEdit from './CastProfileEdit';

const ProfileOwner = ({ profile, isActive, castId }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = () => {
        console.log('Switching to edit mode, profile:', profile);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSave = (updatedProfile) => {
        // ここでプロフィールの更新処理を行う
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <CastProfileEdit 
                profile={profile} 
                onCancel={handleCancelEdit} 
                onSave={handleSave}
                castId={castId}
            />
        );
    }

    return (
        <div>
            <ProfileViewer profile={profile} />
            <Button variant="contained" onClick={handleEdit}>
                Edit Profile
            </Button>
            {!isActive && (
                <p>Your profile is currently inactive. Please contact support to activate it.</p>
            )}
        </div>
    );
};

export default ProfileOwner;