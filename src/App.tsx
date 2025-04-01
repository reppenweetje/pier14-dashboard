import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { theme } from './theme';
import { Dashboard } from './components/Dashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './components/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 300000, // 5 minuten
    },
  },
});

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [period, setPeriod] = useState('30d');

  // Check bij het laden van de app of de gebruiker al is ingelogd
  useEffect(() => {
    const authenticated = localStorage.getItem('dashboard_authenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  // Luister naar periode wijzigingen
  useEffect(() => {
    const handlePeriodChange = (event: CustomEvent) => {
      setPeriod(event.detail);
    };

    window.addEventListener('periodChange', handlePeriodChange as EventListener);
    return () => {
      window.removeEventListener('periodChange', handlePeriodChange as EventListener);
    };
  }, []);

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isAuthenticated ? (
          <DashboardLayout period={period} onPeriodChange={setPeriod}>
            <Dashboard period={period} />
          </DashboardLayout>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
