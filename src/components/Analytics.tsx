import React from 'react';
import { Box } from '@mui/material';
import { AnalyticsCard } from './AnalyticsCard';
import { RegistrationsCard } from './RegistrationsCard';
import { useQuery } from 'react-query';
import { PlausibleService } from '../services/plausibleService';

interface AnalyticsProps {
  period: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ period }) => {
  const { data: visitors = 0 } = useQuery(['visitors', period], () =>
    PlausibleService.getVisitors(period)
  );

  const { data: pageviews = 0 } = useQuery(['pageviews', period], () =>
    PlausibleService.getPageviews(period)
  );

  const { data: downloads = 0 } = useQuery(['downloads', period], () =>
    PlausibleService.getDownloads(period)
  );

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
      <Box>
        <AnalyticsCard title="Bezoekers" value={visitors} type="visitors" />
      </Box>
      <Box>
        <AnalyticsCard title="Pageviews" value={pageviews} type="pageviews" />
      </Box>
      <Box>
        <AnalyticsCard title="Downloads" value={downloads} type="downloads" />
      </Box>
      <Box>
        <RegistrationsCard period={period} />
      </Box>
    </Box>
  );
}; 