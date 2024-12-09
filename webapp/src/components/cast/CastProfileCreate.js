// src/components/cast/CastProfileCreate.js
import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

const CastProfileCreate = ({ castId }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/api/cast/${castId}/create`, {}, {
                withCredentials: true
            });
            if (response.data.success) {
                navigate(`/cast/${castId}/edit`);
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            // エラー処理（エラーメッセージの表示など）
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateProfile}
            disabled={loading}
        >
            {loading ? <CircularProgress size={24} /> : 'プロフィールを作成'}
        </Button>
    );
};

export default CastProfileCreate;