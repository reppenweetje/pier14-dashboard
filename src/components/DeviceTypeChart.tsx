import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface DeviceData {
  name: string;
  value: number;
}

interface DeviceTypeChartProps {
  data: DeviceData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const deviceLabels: { [key: string]: string } = {
  'desktop': 'Desktop',
  'mobile': 'Mobiel',
  'tablet': 'Tablet'
};

export const DeviceTypeChart: React.FC<DeviceTypeChartProps> = ({ data }) => {
  const formattedData = data
    .map(item => ({
      ...item,
      name: deviceLabels[item.name.toLowerCase()] || item.name
    }))
    .filter(item => item.value > 0);

  if (formattedData.length === 0) {
    return (
      <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
            Devices
          </Typography>
          <Typography sx={{ fontFamily: 'Montserrat', textAlign: 'center', mt: 8 }}>
            Geen data beschikbaar
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
          Devices
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #1e1e1e',
                borderRadius: '4px',
                fontFamily: 'Montserrat',
                color: '#1e1e1e'
              }}
              formatter={(value: number) => [`${value} bezoekers`, '']}
            />
            <Legend wrapperStyle={{ fontFamily: 'Montserrat', color: '#1e1e1e' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 