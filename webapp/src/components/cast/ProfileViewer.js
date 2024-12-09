//webapp/src/components/cast/ProfileViewer.js
import React, { useMemo, useState } from 'react';
import ImageCarousel from '../imageup/ImageCarousel';
import { Box, Typography, Tabs, Tab, Button, Grid } from '@mui/material';
import useStationName from '../../hooks/useStationName';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MiniLog from '../blog/MiniLog'; 

// アイコンのインポート
import FaceIcon from '@mui/icons-material/Face';
import ChatIcon from '@mui/icons-material/Chat';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrainIcon from '@mui/icons-material/Train';

const BASE_URL = process.env.REACT_APP_BASE_URL || '';

const ProfileViewer = ({ profile, castId }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const timestamp = useMemo(() => Date.now(), [profile]);

    const imageUrls = [
        `${BASE_URL}/img/i/${castId}/profile/cast/images/castimage_1.jpg?v=${timestamp}`,
        `${BASE_URL}/img/i/${castId}/profile/cast/images/castimage_2.jpg?v=${timestamp}`,
        `${BASE_URL}/img/i/${castId}/profile/cast/images/castimage_3.jpg?v=${timestamp}`
    ];

    const { stationName, error: stationNameError } = useStationName(profile.support_area);

    // タブの変更ハンドラー
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto', p: 2, backgroundColor: '#fff0f5', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            {/* 画像カルーセル */}
            <Box sx={{ width: '100%', maxWidth: '100%', mb: 2 }}>
                <ImageCarousel images={imageUrls.map((url, index) => ({ path: url, order: index }))} />
            </Box>

            {/* 見出し部分 */}
            <Box sx={{ textAlign: 'left', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Roboto', sans-serif", color: '#d81b60' }}>
                    {profile.name} ({profile.age})
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: "'Roboto', sans-serif" }}>
                    {profile.height} cm / {profile.bust}({profile.cup}) - {profile.waist} - {profile.hip} cm 
                </Typography>
            </Box>

            {/* タブ部分 */}
            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                centered
                sx={{
                    backgroundColor: '#ffe4e1', // タブ全体に淡いピンクの背景色
                    borderBottom: '2px solid #f8bbd0', // 下部に薄いボーダー
                    '& .MuiTab-root': {
                        minWidth: '100px', // タブの最小幅
                        color: '#d81b60',
                        fontWeight: 'bold',
                        fontFamily: "'Comic Sans MS', cursive",
                    },
                    '& .Mui-selected': {
                        color: '#c2185b', // 選択中タブの文字色を強調
                        borderBottom: '3px solid', // 選択中タブに下線を追加
                        borderColor: '#c2185b',
                    },
                }}
            >
                <Tab label={<><FaceIcon sx={{ verticalAlign: 'middle', mr: 1 }} />プロフ</>} />
                <Tab label={<><ChatIcon sx={{ verticalAlign: 'middle', mr: 1 }} />ミニログ</>} />
                <Tab label={<><ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />スケジュール</>} />
            </Tabs>

            {/* タブの内容 */}
            {selectedTab === 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff0f5', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {/* プロフィール情報 */}
                    <Grid container spacing={1}>
                        <Grid item xs={5}>
                            <Typography fontWeight="bold">
                                <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
                                指名料
                            </Typography>
                        </Grid>
                        <Grid item xs={7}><Typography>{profile.selection_fee} pt</Typography></Grid>

                        <Grid item xs={5}>
                            <Typography fontWeight="bold">
                                <HomeIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
                                出身地
                            </Typography>
                        </Grid>
                        <Grid item xs={7}><Typography>{profile.birthplace}</Typography></Grid>

                        <Grid item xs={5}>
                            <Typography fontWeight="bold">
                                <BloodtypeIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
                                血液型
                            </Typography>
                        </Grid>
                        <Grid item xs={7}><Typography>{profile.blood_type}</Typography></Grid>

                        <Grid item xs={5}>
                            <Typography fontWeight="bold">
                                <SportsEsportsIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
                                趣味
                            </Typography>
                        </Grid>
                        <Grid item xs={7}><Typography>{profile.hobby}</Typography></Grid>

                        <Grid item xs={5}>
                            <Typography fontWeight="bold">
                                <WorkIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
                                職業
                            </Typography>
                        </Grid>
                        <Grid item xs={7}><Typography>{profile.job}</Typography></Grid>

                        <Grid item xs={5}>
    <Typography fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
        <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
        派遣エリア
    </Typography>
</Grid>
<Grid item xs={7}>
    <Typography noWrap>{profile.dispatch_prefecture}</Typography>
</Grid>

<Grid item xs={5}>
    <Typography fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
        <TrainIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d81b60' }} />
        対応エリア
    </Typography>
</Grid>
<Grid item xs={7}>
    <Typography noWrap>
        {stationNameError ? stationNameError : `${stationName}駅`}
    </Typography>
</Grid>

                    </Grid>

                    {/* 自己紹介 */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: "'Comic Sans MS', cursive", color: '#d81b60' }}>
                            自己紹介
                        </Typography>
                        <Typography sx={{ fontFamily: "'Comic Sans MS', cursive" }}>{profile.self_introduction}</Typography>
                    </Box>
                </Box>
            )}

            {selectedTab === 1 && (
                <Box sx={{ mt: 2 }}>
                    <MiniLog castId={castId} />
                </Box>
            )}

            {selectedTab === 2 && (
                <Box sx={{ mt: 2 }}>
                    <Typography>スケジュールの内容をここに表示します。</Typography>
                </Box>
            )}

            {/* 予約リクエストボタン */}
            <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    zIndex: 1000,
                    borderRadius: '50px',
                    background: 'linear-gradient(45deg, #f48fb1 30%, #f06292 90%)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #f06292 30%, #ec407a 90%)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                    },
                }}
            >
                予約リクエスト
            </Button>
        </Box>
    );
};

export default ProfileViewer;
