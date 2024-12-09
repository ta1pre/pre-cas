import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const NumberInput = ({ value, onChange, min, max, label, unit, defaultValue, ...props }) => {
  const handleChange = (event) => {
    onChange({ target: { name: props.name, value: event.target.value } });
  };

  const options = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id={`${props.name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${props.name}-label`}
        id={props.name}
        value={value || ''}
        onChange={handleChange}
        label={label}
      >
        <MenuItem value="">
          <em>選択してください</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option} {unit}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default NumberInput;