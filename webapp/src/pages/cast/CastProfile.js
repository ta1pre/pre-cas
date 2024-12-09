// src/pages/cast/CastProfile.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import CastMine from '../../components/auth/CastMine';
import CastProfileContent from '../../components/cast/CastProfileContent';

const CastProfile = () => {
    const { cast_id } = useParams();

    return (
        <Box>
            <CastMine castId={cast_id}>
                {(props) => <CastProfileContent {...props} castId={cast_id} />}
            </CastMine>
        </Box>
    );
};

export default CastProfile;