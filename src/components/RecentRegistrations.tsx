import React from 'react';
import { useQuery } from 'react-query';
import { DirectusService } from '../services/directusService';
import { Box, Typography, List, ListItem, Paper, Chip, Stack, Tooltip } from '@mui/material';
import SailingIcon from '@mui/icons-material/Sailing';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PushPinIcon from '@mui/icons-material/PushPin';

interface Props {
  period: string;
}

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('nl-NL', { 
    day: 'numeric',
    month: 'short'
  });
};

// Kleurenschema voor de status chips
const statusColors = {
  nautical: {
    yes: '#4caf50', // groen
    no: '#f44336', // rood
  },
  financing: {
    yes: '#4caf50', // groen
    no: '#f44336', // rood
    maybe: '#ff9800', // oranje
  }
};

// Helper functie om de financing status te bepalen
const getFinancingStatus = (value: any): 'yes' | 'no' | 'maybe' => {
  if (value === null || value === undefined) return 'maybe';
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'ja') return 'yes';
    if (value.toLowerCase() === 'nee') return 'no';
    if (value.toLowerCase() === 'wellicht') return 'maybe';
  }
  return 'maybe';
};

// Helper functie om de nautical status te bepalen
const getNauticalStatus = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'ja';
  }
  return !!value;
};

const getPeriodLabel = (period: string): string => {
  switch (period) {
    case 'today':
      return 'Registraties vandaag';
    case 'yesterday':
      return 'Registraties gisteren';
    case '3d':
      return 'Registraties laatste 3 dagen';
    case '7d':
      return 'Registraties laatste 7 dagen';
    case '14d':
      return 'Registraties laatste 14 dagen';
    case '30d':
      return 'Registraties laatste 30 dagen';
    case '90d':
      return 'Registraties laatste 90 dagen';
    case '1y':
      return 'Registraties laatste jaar';
    default:
      return 'Alle registraties';
  }
};

export const RecentRegistrations: React.FC<Props> = ({ period }) => {
  const { data: registrations = [] } = useQuery(
    ['recent-registrations', period],
    () => DirectusService.getRecentRegistrations(period)
  );

  // Extra debug logging voor de query
  console.log('Query details:', {
    period,
    registrationsCount: registrations.length,
    firstDate: registrations[0]?.created_at,
    lastDate: registrations[registrations.length - 1]?.created_at
  });

  console.log('Registrations data:', registrations); // Debug logging

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
        {getPeriodLabel(period)}
      </Typography>
      <List>
        {registrations.map((registration) => {
          const financingStatus = getFinancingStatus(registration.financing);
          const isNautical = getNauticalStatus(registration.nautical);
          const hasFavorites = registration.favourites && Array.isArray(registration.favourites) && registration.favourites.length > 0;
          
          console.log('Processing registration BASIC:', { 
            id: registration.id,
            name: `${registration.first_name} ${registration.last_name}`,
            raw_registration: JSON.stringify(registration)
          });
          
          return (
            <ListItem 
              key={registration.id} 
              divider 
              sx={{ py: 2, px: 2 }}
            >
              <Box sx={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center',
                gap: 2
              }}>
                {/* Datum */}
                <Typography sx={{ 
                  fontFamily: 'Montserrat', 
                  fontSize: '0.9rem',
                  bgcolor: '#f5f5f5',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  width: '80px',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  {formatDate(registration.created_at)}
                </Typography>

                {/* Naam */}
                <Typography sx={{ 
                  fontFamily: 'Montserrat', 
                  fontWeight: 'bold',
                  width: '180px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {`${registration.first_name} ${registration.last_name}`}
                </Typography>

                {/* Email */}
                <Typography sx={{ 
                  fontFamily: 'Montserrat', 
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  width: '220px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {registration.email}
                </Typography>

                {/* Telefoonnummer - Duidelijker geplaatst naast e-mail */}
                <Typography sx={{ 
                  fontFamily: 'Montserrat', 
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  width: '130px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {registration.phone_number || '-'}
                </Typography>
                
                <Box sx={{ flexGrow: 1 }} />

                {/* Status Chips */}
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  {/* Punaise icoon voor favorieten - verplaatst naar rechts */}
                  <Tooltip title={hasFavorites ? 'Heeft favorieten' : 'Geen favorieten'}>
                    <Chip
                      icon={<PushPinIcon />}
                      label={hasFavorites ? registration.favourites?.length.toString() : '0'}
                      size="small"
                      sx={{ 
                        fontFamily: 'Montserrat',
                        bgcolor: hasFavorites ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        color: hasFavorites ? '#4caf50' : '#f44336',
                        borderColor: hasFavorites ? '#4caf50' : '#f44336',
                        border: '1px solid',
                        '& .MuiChip-icon': {
                          color: hasFavorites ? '#4caf50' : '#f44336',
                          transform: hasFavorites ? 'none' : 'rotate(45deg)'
                        },
                        height: '24px'
                      }}
                    />
                  </Tooltip>
                  <Chip
                    icon={<SailingIcon />}
                    label={isNautical ? 'JA' : 'NEE'}
                    size="small"
                    sx={{ 
                      fontFamily: 'Montserrat',
                      bgcolor: isNautical ? statusColors.nautical.yes : statusColors.nautical.no,
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white'
                      },
                      width: '80px',
                      height: '24px'
                    }}
                  />
                  <Chip
                    icon={<AccountBalanceIcon />}
                    label={
                      financingStatus === 'yes' ? 'JA' : 
                      financingStatus === 'no' ? 'NEE' : 
                      'WELLICHT'
                    }
                    size="small"
                    sx={{ 
                      fontFamily: 'Montserrat',
                      bgcolor: 
                        financingStatus === 'yes' ? statusColors.financing.yes :
                        financingStatus === 'no' ? statusColors.financing.no :
                        statusColors.financing.maybe,
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white'
                      },
                      width: '100px',
                      height: '24px'
                    }}
                  />
                </Stack>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};