// src/hooks/useStationName.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useStationName = (stationId) => {
    const [stationName, setStationName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStationName = async (stationId) => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/area/station_name/${stationId}`);
                setStationName(response.data.station_name);  // APIから取得した駅名を設定
            } catch (err) {
                console.error('Failed to fetch station name:', err);
                setStationName("駅情報がありません");
                setError('駅情報が取得できませんでした');
            }
        };

        if (stationId) {
            fetchStationName(stationId);
        }
    }, [stationId]);

    return { stationName, error };
};

export default useStationName;
