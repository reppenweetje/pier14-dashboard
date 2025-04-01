import React from 'react';
import { Box } from '@mui/material';
import { AnalyticsCard } from './AnalyticsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { DeviceTypeChart } from './DeviceTypeChart';
import { DevicesChart } from './DevicesChart';
import { RegistrationsCard } from './RegistrationsCard';
import { RecentRegistrations } from './RecentRegistrations';
import { TopFavorites } from './TopFavorites';
import { PlausibleService } from '../services/plausibleService';
import { DirectusService } from '../services/directusService';
import { useQuery } from 'react-query';
import { RegistrationsChart } from './RegistrationsChart';

interface DashboardProps {
  period: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ period }) => {
  const { data: metrics } = useQuery(['metrics', period], () => PlausibleService.getMetrics(period));
  const { data: timeseriesData } = useQuery(['timeseries', period], () => PlausibleService.getTimeseriesData(period));
  const { data: deviceTypes } = useQuery(['deviceTypes', period], () => PlausibleService.getDeviceTypesData(period));
  const { data: browsers } = useQuery(['browsers', period], () => PlausibleService.getBrowsersData(period));
  const { data: registrationTimeseries } = useQuery(
    ['registrationTimeseries', period],
    () => DirectusService.getRegistrationTimeseries(period)
  );

  // Bereken gemiddelde tijd op site in minuten
  const avgTimeOnSite = metrics ? Math.round(metrics.visit_duration / 60) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Stats Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: 3,
        '& > *': {
          minWidth: 0, // Voorkomt overflow in grid items
        }
      }}>
        <AnalyticsCard
          title="Bezoekers"
          value={metrics?.visitors || 0}
          type="visitors"
        />
        <AnalyticsCard
          title="Pageviews"
          value={metrics?.pageviews || 0}
          type="pageviews"
        />
        <AnalyticsCard
          title="Downloads"
          value={metrics?.downloads || 0}
          type="downloads"
        />
        <AnalyticsCard
          title="Gem. Tijd"
          value={`${avgTimeOnSite}m`}
          type="time"
        />
        <RegistrationsCard period={period} />
      </Box>

      {/* Analytics & Registrations Charts Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 3 
      }}>
        <AnalyticsChart data={timeseriesData || []} />
        <RegistrationsChart data={registrationTimeseries || []} />
      </Box>

      {/* Charts & Favorites Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 3,
        '& > *': {
          minWidth: 0,
        }
      }}>
        <DeviceTypeChart data={deviceTypes || []} />
        <DevicesChart data={browsers || []} />
        <TopFavorites period={period} />
      </Box>

      {/* Recent Registrations */}
      <Box>
        <RecentRegistrations period={period} />
      </Box>
    </Box>
  );
}; 