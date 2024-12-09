// src/components/UserProfile.js
import React from 'react';

const UserProfile = ({ userProfile, onLogout }) => {
    return (
        <div>
            <h1>UserProfile.jsようこそ, {userProfile.displayName}</h1>
        </div>
    );
};

export default UserProfile;