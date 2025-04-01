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

interface DevicesChartProps {
  data: DeviceData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff'];

const browserLabels: { [key: string]: string } = {
  'Safari': 'Safari',
  'Chrome': 'Chrome',
  'Microsoft Edge': 'Edge',
  'Samsung Browser': 'Samsung',
  'Firefox': 'Firefox'
};

export const DevicesChart: React.FC<DevicesChartProps> = ({ data }) => {
  const formattedData = data
    .map(item => ({
      ...item,
      name: browserLabels[item.name] || item.name
    }))
    .filter(item => item.value > 0);

  if (formattedData.length === 0) {
    return (
      <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
            Browsers
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
          Browsers
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={0}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(1)}%` : null}
              startAngle={180}
              endAngle={-180}
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
                fontSize: '11px',
                color: '#1e1e1e'
              }}
              formatter={(value: number) => [`${value} bezoekers`, '']}
            />
            <Legend 
              wrapperStyle={{ 
                fontFamily: 'Montserrat', 
                fontSize: '11px',
                paddingTop: '20px'
              }}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 