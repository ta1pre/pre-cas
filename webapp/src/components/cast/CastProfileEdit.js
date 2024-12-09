// src/components/cast/CastProfileEdit.js
import React, { useState } from 'react';
import axios from 'axios';
import { 
    Box, Button, TextField, Typography, Grid, Dialog, DialogTitle, 
    DialogContent, DialogActions, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import AreaSelector from '../common/AreaSelector';
import NumberInput from '../common/NumberInput';
import { prefectures } from '../../utils/constants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useStationName from '../../hooks/useStationName';

const selection_feeOptions = [
    100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 
    2000, 3000, 4000, 5000, 8000, 10000
];

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

const CastProfileEdit = ({ profile, onCancel, onSave }) => {
    const [editedProfile, setEditedProfile] = useState({ 
    ...profile,
    selection_fee: profile.selection_fee || 200  // デフォルト値2000を設定
});

    const [openAreaDialog, setOpenAreaDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { stationName } = useStationName(editedProfile.support_area);  // 駅IDが変わると再取得

    const bloodTypes = ['A', 'B', 'O', 'AB'];
    const cupSizes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

    const validateForm = () => {
        const newErrors = {};
        if (!editedProfile.name) newErrors.name = '名前は必須です';
        if (editedProfile.age < 18 || editedProfile.age > 60) newErrors.age = '年齢は18歳から60歳の間で入力してください';
        if (editedProfile.height < 130 || editedProfile.height > 200) newErrors.height = '身長は130cmから200cmの間で入力してください';
        if (editedProfile.bust < 70 || editedProfile.bust > 100) newErrors.bust = 'バストは70cmから100cmの間で入力してください';
        if (editedProfile.waist < 45 || editedProfile.waist > 65) newErrors.waist = 'ウエストは45cmから65cmの間で入力してください';
        if (editedProfile.hip < 70 || editedProfile.hip > 100) newErrors.hip = 'ヒップは70cmから100cmの間で入力してください';
        if (!cupSizes.includes(editedProfile.cup)) newErrors.cup = 'カップはAからKの間で選択してください';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // 数値フィールドの処理
    if (['age', 'height', 'bust', 'waist', 'hip', 'selection_fee'].includes(name)) {
        processedValue = value === '' ? null : parseInt(value, 10);
    }

    // 特別な処理が必要なフィールド
    if (name === 'is_active') {
        processedValue = value === '1' ? 1 : 0;
    }

    setEditedProfile(prev => ({ ...prev, [name]: processedValue }));
};

    const cleanProfileData = (profile) => {
        const { id, cast_id, profile_image_url, is_active, ...cleanedProfile } = profile;
        return cleanedProfile;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validateForm()) return;
        setIsLoading(true);
    
        // プロファイルデータのクリーンアップ
        const cleanedProfile = {
            name: editedProfile.name,
            age: editedProfile.age,
            height: editedProfile.height,
            bust: editedProfile.bust,
            cup: editedProfile.cup,
            waist: editedProfile.waist,
            hip: editedProfile.hip,
            birthplace: editedProfile.birthplace,
            blood_type: editedProfile.blood_type,
            hobby: editedProfile.hobby,
            selection_fee: editedProfile.selection_fee,
            self_introduction: editedProfile.self_introduction,
            job: editedProfile.job,
            dispatch_prefecture: editedProfile.dispatch_prefecture,
            support_area: editedProfile.support_area,
            is_active: editedProfile.is_active
        };
    
        // 空の値を削除
        Object.keys(cleanedProfile).forEach(key => 
            (cleanedProfile[key] === undefined || cleanedProfile[key] === null || cleanedProfile[key] === '') 
            && delete cleanedProfile[key]
        );
    
        console.log('Submitting profile:', cleanedProfile);
    
        try {
            await onSave(cleanedProfile);
        } catch (error) {
            console.error('Error submitting profile:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleOpenAreaDialog = () => {
        setOpenAreaDialog(true);
    };

    const handleCloseAreaDialog = () => {
        setOpenAreaDialog(false);
    };

    const handleAreaSelect = (area) => {
    console.log("Selected area:", area); // 選択結果のログ
    setEditedProfile(prev => ({
        ...prev,
        dispatch_prefecture: area.prefecture,
        support_area: area.stationId  // 駅IDのみを設定
    }));
    handleCloseAreaDialog();
};



    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '100%', width: '100%', padding: '0 16px', boxSizing: 'border-box', margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>キャストプロフィール編集</Typography>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onCancel}  // 既存のonCancelプロップを使用
                sx={{ mb: 2 }}
            >
                プロフィールに戻る
            </Button>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        label="Name"
                        value={editedProfile.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="selection-fee-label">指名料 (100pt=1,000円)</InputLabel>
                        <Select
                            labelId="selection-fee-label"
                            id="selection_fee"
                            name="selection_fee"
                            value={editedProfile.selection_fee || 200}  // デフォルト値2000
                            onChange={handleChange}
                            label="指名料 (100pt=1,000円)"
                        >
                            {selection_feeOptions.map((fee) => (
                                <MenuItem key={fee} value={fee}>
                                    {fee} pt
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <NumberInput
                        fullWidth
                        name="age"
                        label="年齢"
                        value={editedProfile.age}
                        onChange={handleChange}
                        error={!!errors.age}
                        helperText={errors.age}
                        min={18}
                        max={60}
                        unit="歳"
                        defaultValue={18}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <NumberInput
                        fullWidth
                        margin="normal"
                        name="height"
                        label="身長 (cm)"
                        value={editedProfile.height}
                        onChange={handleChange}
                        error={!!errors.height}
                        helperText={errors.height}
                        min={130}
                        max={198}
                        unit="cm"
                        defaultValue={158}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
                        <NumberInput
                            sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.9rem' } }}
                            margin="dense"
                            name="bust"
                            label="B"
                            type="number"
                            value={editedProfile.bust}
                            onChange={handleChange}
                            error={!!errors.bust}
                            helperText={errors.bust}
                            min={70}
                            max={120}
                            unit="cm"
                            defaultValue={84}
                        />
                        <NumberInput
                            sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.9rem' } }}
                            margin="dense"
                            name="waist"
                            label="W"
                            type="number"
                            value={editedProfile.waist}
                            onChange={handleChange}
                            error={!!errors.waist}
                            helperText={errors.waist}
                            min={40}
                            max={70}
                            unit="cm"
                            defaultValue={56}
                        />
                        <NumberInput
                            sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.9rem' } }}
                            margin="dense"
                            name="hip"
                            label="H"
                            type="number"
                            value={editedProfile.hip}
                            onChange={handleChange}
                            error={!!errors.hip}
                            helperText={errors.hip}
                            min={70}
                            max={100}
                            unit="cm"
                            defaultValue={82}
                        />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                        3サイズは86/56/84を平均体型の目安で入力して下さい。
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="cup-label">胸のサイズ</InputLabel>
                        <Select
                            labelId="cup-label"
                            id="cup"
                            name="cup"
                            value={editedProfile.cup}
                            onChange={handleChange}
                            label="カップ"
                        >
                            {cupSizes.map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}カップ
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="birthplace-label">出身地</InputLabel>
                        <Select
                            labelId="birthplace-label"
                            id="birthplace"
                            name="birthplace"
                            value={editedProfile.birthplace}
                            onChange={handleChange}
                            label="出身地"
                        >
                            {prefectures.map((prefecture) => (
                                <MenuItem key={prefecture} value={prefecture}>
                                    {prefecture}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="blood-type-label">血液型</InputLabel>
                        <Select
                            labelId="blood-type-label"
                            id="blood_type"
                            name="blood_type"
                            value={editedProfile.blood_type}
                            onChange={handleChange}
                            label="血液型"
                        >
                            {bloodTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}型
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="hobby"
                        label="趣味"
                        value={editedProfile.hobby}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="job"
                        label="現職/前職"
                        value={editedProfile.job}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
            <TextField
                fullWidth
                margin="normal"
                name="support_area"
                label="対応エリア"
                value={stationName || ''}  // フックから取得した駅名を表示
                InputProps={{
                    readOnly: true,
                }}
                variant="outlined"
                InputLabelProps={{
                    shrink: true,
                }}
                onClick={handleOpenAreaDialog}
                sx={{ cursor: 'pointer' }}
            />
        </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="self_introduction"
                        label="アピール"
                        multiline
                        rows={4}
                        value={editedProfile.self_introduction}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="contained" color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" type="submit" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : '変更を保存'}
                </Button>
            </Box>

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}

            {message && (
                <Typography color="success" sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}

            <Dialog 
    open={openAreaDialog} 
    onClose={handleCloseAreaDialog}
    disableEnforceFocus={true} 
    disableRestoreFocus={true} 
    disableAutoFocus={true}
>
    <DialogTitle>エリアを選択してください</DialogTitle>
    <DialogContent>
        <AreaSelector onSelect={handleAreaSelect} />
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseAreaDialog}>キャンセル</Button>
    </DialogActions>
</Dialog>

        </Box>
    );
};

export default CastProfileEdit;