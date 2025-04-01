import React from 'react';
import { Card, CardContent, Typography, List, ListItem } from '@mui/material';
import { useQuery } from 'react-query';
import { DirectusService } from '../services/directusService';

interface TopFavoritesProps {
  period: string;
}

// Mapping van ID naar Unit nummer
const unitMapping: { [key: string]: string } = {
  '165': 'Unit 2',
  '166': 'Unit 25',
  '167': 'Unit 24',
  '168': 'Unit 23',
  '10': 'Unit 10',
  '11': 'Unit 11',
  '8': 'Unit 12',
  '13': 'Unit 13',
  '9': 'Unit 14',
  '172': 'Unit 15',
  '171': 'Unit 20',
  '170': 'Unit 21',
  '169': 'Unit 22',
};

export const TopFavorites: React.FC<TopFavoritesProps> = ({ period }) => {
  console.log(`[TopFavorites] Component rendered with period: ${period}`);

  // Gebruik useQuery met verbeterde caching opties
  const { data: favorites, isLoading, isError, refetch } = useQuery(
    ['top-favorites', period], // Query key bevat periode
    () => {
      console.log(`[TopFavorites] Fetching data for period: ${period}`);
      return DirectusService.getTopFavorites(period);
    },
    {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 60000, // 1 minuut 
      cacheTime: 300000, // 5 minuten
      onSuccess: (data) => {
        console.log(`[TopFavorites] Data succesvol geladen voor periode '${period}':`, data);
      },
      onError: (error) => {
        console.error(`[TopFavorites] Fout bij laden data voor periode '${period}':`, error);
      }
    }
  );

  // Force expliciet een refetch wanneer de periode verandert
  React.useEffect(() => {
    console.log(`[TopFavorites] Period changed to: ${period}, triggering refetch...`);
    refetch();
  }, [period, refetch]);

  // Converteer en sorteer de data
  const processedFavorites = React.useMemo(() => {
    if (!favorites) {
      console.log('[TopFavorites] No favorites data available');
      return [];
    }
    
    console.log(`[TopFavorites] Processing ${favorites.length} favorites`);
    return favorites
      .map(favorite => ({
        ...favorite,
        unitName: unitMapping[favorite.item] || `Unit ${favorite.item}` // Fallback naar originele waarde
      }))
      .sort((a, b) => {
        // Haal het unit nummer uit de string en vergelijk
        const getUnitNumber = (str: string) => {
          const num = parseInt(str.replace('Unit ', ''));
          return isNaN(num) ? 0 : num;
        };
        return getUnitNumber(a.unitName) - getUnitNumber(b.unitName);
      });
  }, [favorites]);

  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: 'background.paper', 
      border: 2, 
      borderColor: '#EDFF00',
      '& .MuiCardContent-root': {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ 
          fontFamily: 'Montserrat',
          mb: 1,
          fontSize: '1rem'
        }}>
          Meest Geselecteerde Units ({period})
        </Typography>
        {isLoading ? (
          <Typography sx={{ fontFamily: 'Montserrat', textAlign: 'center', mt: 2 }}>
            Laden...
          </Typography>
        ) : isError ? (
          <Typography sx={{ fontFamily: 'Montserrat', textAlign: 'center', mt: 2, color: 'error.main' }}>
            Fout bij laden data
          </Typography>
        ) : processedFavorites.length === 0 ? (
          <Typography sx={{ fontFamily: 'Montserrat', textAlign: 'center', mt: 2, fontStyle: 'italic' }}>
            Geen favorieten gevonden
          </Typography>
        ) : (
          <List sx={{ 
            flexGrow: 1,
            p: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 1
          }}>
            {processedFavorites.map((favorite) => (
              <ListItem 
                key={favorite.item} 
                sx={{ 
                  px: 1,
                  py: 0.5,
                  border: '1px solid #EDFF00',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}
                >
                  {favorite.unitName}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: '0.8rem',
                    color: 'text.secondary'
                  }}
                >
                  {favorite.count}x
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}; 