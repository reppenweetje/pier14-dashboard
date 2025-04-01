import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageviewIcon from '@mui/icons-material/Pageview';
import DownloadIcon from '@mui/icons-material/Download';
import TimerIcon from '@mui/icons-material/Timer';

interface AnalyticsCardProps {
  title: string;
  value: number | string;
  type: 'visitors' | 'pageviews' | 'downloads' | 'time';
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  value, 
  type,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'visitors':
        return <VisibilityIcon sx={{ fontSize: 40, color: '#8884d8' }} />;
      case 'pageviews':
        return <PageviewIcon sx={{ fontSize: 40, color: '#8884d8' }} />;
      case 'downloads':
        return <DownloadIcon sx={{ fontSize: 40, color: '#8884d8' }} />;
      case 'time':
        return <TimerIcon sx={{ fontSize: 40, color: '#8884d8' }} />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
          {getIcon()}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 