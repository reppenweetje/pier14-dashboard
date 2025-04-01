import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SailingIcon from '@mui/icons-material/Sailing';
import { useQuery } from 'react-query';
import { DirectusService } from '../services/directusService';

interface RegistrationsCardProps {
  period: string;
}

// Lijst met geluidsbestanden in de public map
const soundFiles = [
  '/Yeah Boy.mp3',
  '/Crazy.mp3',
  '/What-a-fuck.mp3',
  '/Yeah.mp3',
  '/Letsgo.mp3',
  '/Coin.mp3',
  '/Gong.mp3',
  '/Bambambolam.mp3'
];

export const RegistrationsCard: React.FC<RegistrationsCardProps> = ({ period }) => {
  const { data: registrations, isLoading, error } = useQuery(
    ['registrations', period],
    () => DirectusService.getTotalRegistrations(period),
    {
      // Regelmatig opnieuw ophalen (bv. elke 30 seconden)
      refetchInterval: 30000, 
    }
  );

  const [prevTotal, setPrevTotal] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const currentTotal = registrations?.total;

    console.log('[RegistrationsCard] Checking for new registrations:', { prevTotal, currentTotal });

    // Controleer of currentTotal een geldig nummer is en of prevTotal is ingesteld
    if (typeof currentTotal === 'number' && prevTotal !== null) {
      // Controleer of het aantal is toegenomen
      if (currentTotal > prevTotal) {
        console.log(`[RegistrationsCard] New registration detected! Count increased from ${prevTotal} to ${currentTotal}. Playing sound.`);
        
        // Kies een willekeurig geluid
        const randomIndex = Math.floor(Math.random() * soundFiles.length);
        const soundToPlay = soundFiles[randomIndex];
        console.log(`[RegistrationsCard] Selected sound: ${soundToPlay}`);

        // Maak en speel het audio element af
        if (audioRef.current) {
          audioRef.current.pause(); // Stop eventueel vorig geluid
        }
        audioRef.current = new Audio(soundToPlay);
        audioRef.current.play().catch(e => {
          // Vang autoplay errors op (vaak door browser policy)
          console.error('[RegistrationsCard] Error playing sound:', e);
          // Optioneel: Toon een melding aan de gebruiker dat interactie nodig is
        });
      }
    }

    // Update de vorige waarde voor de volgende check, alleen als currentTotal een nummer is
    if (typeof currentTotal === 'number') {
        setPrevTotal(currentTotal);
    }

  }, [registrations, prevTotal]); // Effect opnieuw uitvoeren als registraties of prevTotal verandert

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: 2, borderColor: '#EDFF00' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
          <PersonAddIcon sx={{ fontSize: 40, color: '#8884d8' }} />
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat' }}>
            Registraties
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>
              {isLoading ? '...' : registrations?.total ?? 0} {/* Gebruik ?? 0 voor fallback */}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SailingIcon sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography sx={{ fontFamily: 'Montserrat', color: '#4caf50', fontSize: '1rem' }}>
                {isLoading ? '...' : registrations?.nautical ?? 0} {/* Gebruik ?? 0 voor fallback */}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}; 