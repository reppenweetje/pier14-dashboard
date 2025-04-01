import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

// Haal het wachtwoord op uit environment variables
const DASHBOARD_PASSWORD = process.env.REACT_APP_DASHBOARD_PASSWORD;

// Controleer of het wachtwoord is ingesteld
if (!DASHBOARD_PASSWORD) {
  console.error('Dashboard wachtwoord niet geconfigureerd! Zet REACT_APP_DASHBOARD_PASSWORD in je .env bestand.');
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      localStorage.setItem('dashboard_authenticated', 'true');
      onLogin(true);
      setError(false);
    } else {
      setError(true);
      localStorage.removeItem('dashboard_authenticated');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <Card sx={{ width: 400, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontFamily: 'Montserrat' }}>
              Reppit Dashboard
            </Typography>
            
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              helperText={error ? 'Incorrect wachtwoord' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              sx={{ 
                bgcolor: '#EDFF00', 
                color: 'black',
                '&:hover': {
                  bgcolor: '#d4e500'
                }
              }}
            >
              Inloggen
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 