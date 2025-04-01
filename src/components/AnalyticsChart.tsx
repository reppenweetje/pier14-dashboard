import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';

interface TimeseriesDataPoint {
  date: string;
  visitors: number;
  pageviews: number;
}

interface AnalyticsChartProps {
  data: TimeseriesDataPoint[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const formatTooltipLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
          Bezoekers & Paginaweergaven
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontFamily: 'Montserrat', fontSize: 12 }}
            />
            <YAxis tick={{ fontFamily: 'Montserrat', fontSize: 12 }} />
            <Tooltip
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                fontFamily: 'Montserrat',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontFamily: 'Montserrat',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#8884d8"
              name="Bezoekers"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="pageviews"
              stroke="#82ca9d"
              name="Paginaweergaven"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 