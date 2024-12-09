// src/components/common/AreaSelector.js

import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api/area`;


const AreaSelector = ({ onSelect }) => {
  const [prefectures, setPrefectures] = useState([]);
  const [lines, setLines] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrefectures();
  }, []);

  useEffect(() => {
    if (selectedPrefecture && allStations.length > 0) {
      filterStationsByPrefecture();
    }
  }, [selectedPrefecture, allStations]);

  const fetchData = async (url, setStateFunction) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setStateFunction(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
        setError('データの形式が正しくありません。');
        setStateFunction([]);
      }
    } catch (error) {
      console.error(`Failed to fetch data from ${url}:`, error);
      setError('データの取得に失敗しました。');
      setStateFunction([]);
    }
    setLoading(false);
  };

  const fetchPrefectures = () => fetchData(`${API_BASE_URL}/prefectures`, setPrefectures);
  const fetchLines = (prefectureId) => fetchData(`${API_BASE_URL}/lines/${prefectureId}`, setLines);
  const fetchStations = (lineId) => fetchData(`${API_BASE_URL}/stations/${lineId}`, setAllStations);

  const filterStationsByPrefecture = () => {
    const filtered = allStations.filter(station => station.prefecture_id === parseInt(selectedPrefecture));
    setFilteredStations(filtered);
  };

  const handlePrefectureChange = (event) => {
    const prefectureId = event.target.value;
    setSelectedPrefecture(prefectureId);
    setSelectedLine('');
    setSelectedStation('');
    fetchLines(prefectureId);
  };

  const handleLineChange = (event) => {
    const lineId = event.target.value;
    setSelectedLine(lineId);
    setSelectedStation('');
    fetchStations(lineId);
  };

  const handleStationChange = (event) => {
    const stationId = event.target.value;
    setSelectedStation(stationId);
    const selectedPrefectureObj = prefectures.find(p => p.id === parseInt(selectedPrefecture));
    const selectedLineObj = lines.find(l => l.id === parseInt(selectedLine));
    const selectedStationObj = filteredStations.find(s => s.id === parseInt(stationId));
    onSelect({
      prefecture: selectedPrefectureObj?.name,
      line: selectedLineObj?.name,
      station: selectedStationObj?.name,
      stationId: stationId
    });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, maxWidth: 300, margin: '0 auto' }}>
      <FormControl fullWidth>
        <InputLabel>県</InputLabel>
        <Select
          value={selectedPrefecture}
          label="県"
          onChange={handlePrefectureChange}
        >
          {prefectures.map(prefecture => (
            <MenuItem key={prefecture.id} value={prefecture.id}>{prefecture.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedPrefecture && (
        <FormControl fullWidth>
          <InputLabel>路線</InputLabel>
          <Select
            value={selectedLine}
            label="路線"
            onChange={handleLineChange}
          >
            {lines.map(line => (
              <MenuItem key={line.id} value={line.id}>{line.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedLine && (
        <FormControl fullWidth>
          <InputLabel>駅</InputLabel>
          <Select
            value={selectedStation}
            label="駅"
            onChange={handleStationChange}
          >
            {filteredStations.map(station => (
              <MenuItem key={station.id} value={station.id}>{station.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default AreaSelector;