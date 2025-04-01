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
// import { nl } from 'date-fns/locale/nl'; // Niet per se nodig voor format

interface RegistrationTimeseriesPoint {
  date: string;
  count: number;
}

interface RegistrationsChartProps {
  data: RegistrationTimeseriesPoint[];
}

export const RegistrationsChart: React.FC<RegistrationsChartProps> = ({ data }) => {
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const formatTooltipLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Bereken het interval voor de X-as ticks op basis van de hoeveelheid data
  const getTickInterval = (dataLength: number) => {
    if (dataLength <= 14) return 1; // Toon alle datums voor korte periodes
    if (dataLength <= 31) return 2; // Toon om de andere dag voor ~30 dagen
    if (dataLength <= 90) return 7; // Toon wekelijks voor ~90 dagen
    return 30; // Toon maandelijks voor langere periodes
  };

  // Genereer de ticks voor de X-as
  const getXAxisTicks = () => {
    if (!data || data.length === 0) return [];
    const interval = getTickInterval(data.length);
    
    // Log de waarden voor debugging
    console.log('[RegistrationsChart] Debug Info:', {
      dataLength: data.length,
      calculatedInterval: interval,
    });

    const generatedTicks = data
      .map((item, index) => index % interval === 0 ? item.date : null)
      .filter((date): date is string => date !== null);
      
    console.log('[RegistrationsChart] Generated Ticks:', generatedTicks);
    
    return generatedTicks;
  };

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
          Registraties per Dag
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontFamily: 'Montserrat', fontSize: 12 }}
              ticks={getXAxisTicks()}
            />
            <YAxis tick={{ fontFamily: 'Montserrat', fontSize: 12 }} allowDecimals={false} />
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
              dataKey="count"
              stroke="#ff7300" // Oranje kleur
              name="Registraties"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 