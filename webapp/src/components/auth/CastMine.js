// src/components/auth/CastMine.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getCastProfile, createCastProfile } from '../../api/castAPI';

const CastMine = ({ children, castId }) => {
    const [isOwner, setIsOwner] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { loggedIn, userProfile } = useContext(AuthContext);
    const [castProfile, setCastProfile] = useState(null);

    useEffect(() => {
        const checkOwnershipAndStatus = async () => {
            if (loggedIn && userProfile && userProfile.userInvitationId === castId) {
                setIsOwner(true);
                try {
                    const response = await getCastProfile(castId);
                    setIsActive(response.profile.is_active);
                    setCastProfile(response.profile);
                } catch (err) {
                    console.error('Error fetching cast profile:', err);
                    if (err.response && err.response.status === 404) {
                        try {
                            await createCastProfile(castId);
                            // プロファイル作成後、ページをリロード
                            window.location.reload();
                            return; // リロード後は以降の処理は不要
                        } catch (createError) {
                            console.error("Error creating new cast profile:", createError);
                            setError("Failed to create cast profile");
                        }
                    } else {
                        setError("Failed to fetch cast profile");
                    }
                }
            } else {
                setIsOwner(false);
            }
            setLoading(false);
        };

        checkOwnershipAndStatus();
    }, [castId, loggedIn, userProfile]);

    return children({
        loading,
        error,
        isOwner,
        isActive,
        loggedIn,
        castProfile
    });
};

export default CastMine;