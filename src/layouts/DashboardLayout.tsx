import React from 'react';
import { styled } from '@mui/material/styles';
import { AppBar, Box, Toolbar, Typography, Container } from '@mui/material';
import { PeriodSelector } from '../components/PeriodSelector';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#0F0F70',
  boxShadow: 'none',
  borderBottom: '2px solid #EDFF00'
}));

const HeaderText = styled(Typography)({
  fontFamily: 'Montserrat',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em'
});

const YellowText = styled(HeaderText)({
  color: '#EDFF00'
});

const BlueText = styled(HeaderText)({
  color: '#D8D6D6'
});

const SubText = styled(Typography)({
  fontFamily: 'Montserrat',
  color: '#D8D6D6',
  textTransform: 'uppercase',
  opacity: 0.8,
  textShadow: '0 0 10px rgba(216, 214, 214, 0.5)',
  letterSpacing: '0.2em',
  marginTop: '-8px'
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  period: string;
  onPeriodChange: (period: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  period, 
  onPeriodChange 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: '#D8D6D6'
    }}>
      <StyledAppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <YellowText variant="h4">
                PIER14
              </YellowText>
              <BlueText variant="h5">
                KOOPOMGEVING
              </BlueText>
              <YellowText variant="h4">
                DASHBOARD
              </YellowText>
            </Box>
            <SubText variant="subtitle1">
              FASE II
            </SubText>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '& .MuiInputBase-root': {
              color: '#1e1e1e',
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#EDFF00'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#EDFF00'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#EDFF00'
              }
            },
            '& .MuiSelect-icon': {
              color: '#EDFF00'
            },
            '& .MuiFormLabel-root': {
              color: '#1e1e1e'
            },
            '& .MuiSelect-select': {
              color: '#1e1e1e'
            }
          }}>
            <PeriodSelector value={period} onChange={onPeriodChange} />
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Container maxWidth={false} sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}; 