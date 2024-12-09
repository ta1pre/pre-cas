import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, CircularProgress, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DailySchedule from './DailySchedule';
import axios from 'axios';
import AreaSelector from '../common/AreaSelector';  // 駅選択UIのインポート

const DateDetailModal = ({ open, onClose, date, schedule, onSaveSchedule, onDeleteSchedule, castId }) => {
    const [supportArea, setSupportArea] = useState('');
    const [stationNameFromAPI, setStationNameFromAPI] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAreaSelection, setIsAreaSelection] = useState(false);  // モーダル切り替えの状態

    // 駅選択後の処理を定義
    const handleSelectStation = (stationData) => {
        setStationNameFromAPI(stationData.station);  // 選択された駅名をセット
        setSupportArea(stationData.stationId);  // 選択された駅IDをセット
        setIsAreaSelection(false);  // シフト登録画面に戻る
    };

    // 駅IDから駅名を取得する関数
    const fetchStationName = async (stationId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/area/station_name/${stationId}`);
            setStationNameFromAPI(response.data.station_name);
        } catch (err) {
            console.error('Failed to fetch station name:', err);
            setStationNameFromAPI("駅情報がありません");
        }
    };

    useEffect(() => {
        if (!open || !castId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // シフトデータがある場合はシフトの駅IDを使用
                if (schedule && schedule.station_code) {
                    setSupportArea(schedule.station_code);
                    await fetchStationName(schedule.station_code);  // シフトデータの駅IDで駅名を取得
                } else {
                    // シフトデータがない場合はプロフィールの駅IDを使用
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/cast/${castId}/profile`, {
                        withCredentials: true
                    });
                    const supportAreaCode = response.data.profile.support_area;
                    setSupportArea(supportAreaCode);

                    if (supportAreaCode) {
                        await fetchStationName(supportAreaCode);  // プロフィールの駅IDで駅名を取得
                    } else {
                        setStationNameFromAPI("駅情報がありません");
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError("データの取得に失敗しました。");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [castId, open, schedule]);

    const handleSave = async (scheduleData) => {
        try {
            await onSaveSchedule(scheduleData);
            onClose();
        } catch (error) {
            console.error("Error saving schedule:", error);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("本当に削除しますか？");
    
        if (confirmDelete) {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/api/cast-schedule/delete/${castId}/${date.toISOString().split('T')[0]}`,
                    { method: 'DELETE' }
                );
    
                if (!response.ok) {
                    throw new Error('Failed to delete schedule');
                }
    
                if (onDeleteSchedule) {
                    onDeleteSchedule(date);
                }
    
                onClose();
            } catch (error) {
                console.error("Error deleting schedule:", error);
            }
        }
    };

    const handleAreaChange = () => {
        setIsAreaSelection(true);  // 駅選択画面に切り替え
    };

    const handleBackToSchedule = () => {
        setIsAreaSelection(false);  // シフト登録画面に戻す
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isAreaSelection ? 'エリアを選択してください' : `${date?.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のシフト`}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {isAreaSelection ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <AreaSelector onSelect={handleSelectStation} />
                        <Button onClick={handleBackToSchedule} variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                            戻る
                        </Button>
                    </Box>
                ) : (
                    loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <Typography color="error">{error}</Typography>
                        </Box>
                    ) : (
                        <Box>
                            <DailySchedule 
                                castId={castId} 
                                stationName={stationNameFromAPI}  // 駅名を渡す
                                supportArea={supportArea}  // 駅IDを渡す
                                onSave={handleSave}
                                initialDate={date}
                                initialStartTime={schedule?.start_time}
                                initialEndTime={schedule?.end_time}
                                onStationChange={() => setIsAreaSelection(true)}
                            />
                        </Box>
                    )
                )}
            </DialogContent>
            <DialogActions>
                {!isAreaSelection && schedule && (
                    <Button onClick={handleDelete} color="error">
                        シフトを削除
                    </Button>
                )}
                <Button onClick={onClose}>閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DateDetailModal;
