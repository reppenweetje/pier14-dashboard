import React from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface PeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 1, p: 1 }}>
      <FormControl fullWidth>
        <InputLabel id="period-select-label" sx={{ color: '#1e1e1e' }}>Periode</InputLabel>
        <Select
          labelId="period-select-label"
          value={value}
          label="Periode"
          onChange={(e) => onChange(e.target.value)}
          sx={{
            color: '#1e1e1e',
            bgcolor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#EDFF00',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#EDFF00',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#EDFF00',
            },
          }}
        >
          <MenuItem value="today">Vandaag</MenuItem>
          <MenuItem value="yesterday">Gisteren</MenuItem>
          {/* <MenuItem value="3d">Laatste 3 dagen</MenuItem> */}
          <MenuItem value="7d">Laatste 7 dagen</MenuItem>
          <MenuItem value="14d">Laatste 14 dagen</MenuItem>
          <MenuItem value="30d">Laatste 30 dagen</MenuItem>
          {/* <MenuItem value="90d">Laatste 90 dagen</MenuItem> */}
          <MenuItem value="1y">Laatste jaar</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}; 