import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Typography color="text.secondary" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontFamily: 'Montserrat' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}; 