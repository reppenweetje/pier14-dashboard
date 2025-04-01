import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './components/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000, // Ververs elke 30 seconden
      staleTime: 25000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </QueryClientProvider>
  );
}

export default App; 