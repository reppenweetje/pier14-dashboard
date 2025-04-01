import React from 'react';
import { Grid } from '@mui/material';
import { useQuery } from 'react-query';
import {
  People,
  Pageview,
  Timer,
  ExitToApp,
} from '@mui/icons-material';
import { StatsCard } from './StatsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { PlausibleService } from '../services/plausibleService';

export const Dashboard: React.FC = () => {
  const { data: metrics } = useQuery('metrics', () => PlausibleService.getMetrics());
  const { data: timeseriesData } = useQuery('timeseries', () =>
    PlausibleService.getTimeseriesData()
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Bezoekers"
          value={metrics?.visitors || 0}
          icon={<People />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Paginaweergaven"
          value={metrics?.pageviews || 0}
          icon={<Pageview />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Gem. Bezoekduur"
          value={`${Math.round((metrics?.visitDuration || 0) / 60)}m`}
          icon={<Timer />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Bounce Rate"
          value={`${Math.round(metrics?.bounceRate || 0)}%`}
          icon={<ExitToApp />}
        />
      </Grid>
      <Grid item xs={12}>
        <AnalyticsChart
          data={timeseriesData || []}
          title="Bezoekers & Paginaweergaven"
        />
      </Grid>
    </Grid>
  );
}; 