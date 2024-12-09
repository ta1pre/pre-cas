// src/pages/MyPage/account.js

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    Box, Avatar, Badge, Button, TextField, InputAdornment, IconButton, 
    Popover, Typography, FormControl, InputLabel, Select, MenuItem, 
    FormHelperText, CircularProgress
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { prefectures } from '../../utils/constants';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateAllFields } from '../../utils/validators';
import { updateUserAccount } from '../../api/userAPI';
import ProfileImageUploader from '../../components/imageup/ProfileImageUploader';


const Account = () => {
    const { loggedIn, userProfile, updateUserProfile } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [displayPictureUrl, setDisplayPictureUrl] = useState(userProfile?.pictureUrl);
    const [birthDate, setBirthDate] = useState("");  // これを追加することで、未定義のエラーが解消されます

    const {
        values: editedProfile,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        setValues: setEditedProfile,
        setErrors,
        isSubmitting  
    } = useFormValidation(
        {
            displayName: userProfile?.displayName || '',
            userPrefectures: userProfile?.userPrefectures || '',
            userBirth: userProfile?.userBirth || '',
            userEmail: userProfile?.userEmail || '',
            userMobilePhone: userProfile?.userMobilePhone || '',
        },
        validateAllFields
    );

    useEffect(() => {
        if (userProfile) {
            setIsLoading(false);
            setEditedProfile({
                displayName: userProfile.displayName || '',
                userPrefectures: userProfile.userPrefectures || '',
                userBirth: userProfile.userBirth || '',
                userEmail: userProfile.userEmail || '',
                userMobilePhone: userProfile.userMobilePhone || '',
            });
        }
    }, [userProfile, setEditedProfile]);
    // birthDateの値の初期化
    useEffect(() => {
        if (editedProfile.userBirth) {
            setBirthDate(editedProfile.userBirth);
        }
    }, [editedProfile.userBirth]);


    const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
    const handlePopoverClose = () => setAnchorEl(null);
    const open = Boolean(anchorEl);

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({
            displayName: userProfile?.displayName || '',
            userPrefectures: userProfile?.userPrefectures || '',
            userBirth: userProfile?.userBirth || '',
            userEmail: userProfile?.userEmail || '',
            userMobilePhone: userProfile?.userMobilePhone || '',
        });
    };

    const handleSave = async () => {
    console.log('handleSave called');
    console.log('Current profile state:', editedProfile);
    try {
        // APIリクエストのデータをバックエンドのキー名に合わせて整形
        const updatedData = {
            line_id: userProfile.userId,  // 必須フィールドとしてline_idを追加
            nick_name: editedProfile.displayName,  // displayName -> nick_name
            prefectures: editedProfile.userPrefectures,  // userPrefectures -> prefectures
            birth: editedProfile.userBirth,  // userBirth -> birth
            email: editedProfile.userEmail || null,
            mobile_phone: editedProfile.userMobilePhone,  // userMobilePhone -> mobile_phone
            sex: userProfile.userSex,  // 性別を統一
            type: userProfile.type,
        };

        console.log('Sending data to updateUserAccount:', updatedData);
        const result = await updateUserAccount(updatedData);
        console.log('Response from updateUserAccount:', result);

        if (result.user) {
            const updatedProfile = {
                displayName: result.user.nick_name,
                userPrefectures: result.user.prefectures,
                userBirth: result.user.birth,
                userEmail: result.user.email,
                userMobilePhone: result.user.mobile_phone,
                userCreatedAt: result.user.created_at,
                userUpdatedAt: result.user.updated_at,
            };
            setEditedProfile(updatedProfile);
            console.log('Updated local profile:', updatedProfile);
            updateUserProfile(updatedProfile);
        } else {
            console.error('Invalid response format:', result);
        }

        setIsEditing(false);
        setSaveMessage('プロフィールが正常に更新されました');
        setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
        console.error('Failed to update profile:', error);
        setSaveMessage('プロフィールの更新に失敗しました');
    }
};


    const handleDateChange = (date) => {
        const updatedProfile = { ...editedProfile, userBirth: date };
        setEditedProfile(updatedProfile);
        const validationErrors = validateAllFields(updatedProfile);
        setErrors(validationErrors);
    };
    // handleUploadSuccess 関数を追加
    const handleUploadSuccess = (imagePath) => {
        console.log("Uploaded image path:", imagePath); 
        updateUserProfile({ ...userProfile, pictureUrl: imagePath });
    };
    useEffect(() => {
        // userProfileの更新に合わせて表示URLも更新
        if (userProfile?.pictureUrl) {
            setDisplayPictureUrl(userProfile.pictureUrl);
        }
    }, [userProfile]);

    if (isLoading) {
        return (
            
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            
        );
    }
    

    return (
        
            <div>
                {loggedIn ? (
                    <>
                       <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginTop: '20px',
                            marginBottom: '20px',
                            backgroundColor: '#f0f0f0', 
                            padding: '20px', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            maxWidth: '400px',
                            margin: 'auto'
                        }}>
                            
                            <ProfileImageUploader 
    userProfile={userProfile}
    onUploadSuccess={handleUploadSuccess}
/>
                            <Button 
                                variant="contained" 
                                color={isEditing ? "inherit" : "primary"}
                                startIcon={isEditing ? <ArrowBackIcon /> : <EditIcon />}
                                sx={{ 
                                    color: isEditing ? 'rgba(0, 0, 0, 0.87)' : 'white',
                                    backgroundColor: isEditing ? '#e0e0e0' : undefined,
                                    '&:hover': {
                                        backgroundColor: isEditing ? '#d5d5d5' : undefined,
                                    }
                                }}
                                onClick={isEditing ? handleCancel : handleEdit}
                            >
                                {isEditing ? "編集をキャンセル" : "アカウントの編集"}
                            </Button>
                        </Box>
                        <Box sx={{ 
                            backgroundColor: '#f0f0f0', 
                            padding: '20px', 
                            borderRadius: '8px', 
                            marginTop: '20px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            maxWidth: '400px',
                            margin: 'auto'
                        }}>
                            <Typography variant="h6" gutterBottom>アカウント情報</Typography>
                            <TextField
                                label="ニックネーム(非公開)"
                                name="displayName"
                                value={editedProfile.displayName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!isEditing}
                                error={!!errors.displayName}
                                helperText={errors.displayName}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" onClick={handlePopoverOpen}>
                                                <HelpOutlineIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                            />
                            <Popover
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handlePopoverClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                            >
                                <Typography sx={{ p: 2 }}>ゲストの方の予約時や運営とのやりとりで使用します。</Typography>
                            </Popover>
                            <FormControl fullWidth margin="normal" disabled={!isEditing} error={!!errors.userPrefectures}>
                                <InputLabel id="prefecture-label">都道府県(非公開)</InputLabel>
                                <Select
                                    labelId="prefecture-label"
                                    label="都道府県(非公開)"
                                    name="userPrefectures"
                                    value={editedProfile.userPrefectures}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    variant="outlined"
                                >
                                    <MenuItem value="">
                                        <em>選択してください</em>
                                    </MenuItem>
                                    {prefectures.map((pref) => (
                                        <MenuItem key={pref} value={pref}>
                                            {pref}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.userPrefectures && <FormHelperText>{errors.userPrefectures}</FormHelperText>}
                            </FormControl>
                            
                            <CustomDatePicker
            label="生年月日(非公開)"
            value={birthDate || ""}
            onChange={(date) => {
                setBirthDate(date);
                handleDateChange(date);
            }}
            disabled={!isEditing || !!userProfile.userBirth}
            readOnly={!!userProfile.userBirth}
            error={!!errors.userBirth}
            helperText={
                errors.userBirth || 
                (userProfile.userBirth ? "誕生日は変更できません" : "")
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    placeholder="生年月日(非公開)"
                    InputProps={{
                        ...params.InputProps,
                        readOnly: !!userProfile.userBirth,
                        style: userProfile.userBirth ? { color: 'rgba(0, 0, 0, 0.38)' } : {}
                    }}
                />
            )}
        />


                            <TextField
                                label="Email(非公開)"
                                name="userEmail"
                                value={editedProfile.userEmail}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!isEditing}
                                error={!!errors.userEmail}
                                helperText={errors.userEmail}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="電話番号(非公開)"
                                name="userMobilePhone"
                                value={editedProfile.userMobilePhone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!isEditing}
                                error={!!errors.userMobilePhone}
                                helperText={errors.userMobilePhone}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                            />
                            <TextField
    label="アカウント作成日"
    value={userProfile?.userCreatedAt || ''}
    InputProps={{
        readOnly: true,
    }}
    variant="outlined"
    fullWidth
    margin="normal"
    sx={{
        '& .MuiInputBase-input': {
            color: 'rgba(0, 0, 0, 0.87)',
        },
    }}
/>
<TextField
    label="最終更新日"
    value={userProfile?.userUpdatedAt || ''}
    InputProps={{
        readOnly: true,
    }}
    variant="outlined"
    fullWidth
    margin="normal"
    sx={{
        '& .MuiInputBase-input': {
            color: 'rgba(0, 0, 0, 0.87)',
        },
    }}
/>
                            {isEditing && (
    <Box sx={{ mt: 2 }}>
        <Button 
            onClick={handleSave} 
            variant="contained" 
            color="success"
            startIcon={<SaveIcon style={{ color: 'white' }} />}
            sx={{ color: 'white', mr: 1 }}
        >
            保存
        </Button>
        <Button onClick={handleCancel} variant="outlined">
            キャンセル
        </Button>
    </Box>
)}
                        {saveMessage && <Typography color="success" sx={{ mt: 1 }}>{saveMessage}</Typography>}
                        </Box>
                    </>
                ) : (
                    <Typography variant="body1">You are not logged in.</Typography>
                )}
            </div>
        
    );
};

export default Account;