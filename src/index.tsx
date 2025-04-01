import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from 'react-query';

// Debug API configuratie
console.log('🔧 App Environment Variables:');
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('DASHBOARD PASSWORD SET:', process.env.REACT_APP_DASHBOARD_PASSWORD ? 'YES' : 'NO');
console.log('DIRECTUS TOKEN SET:', process.env.REACT_APP_DIRECTUS_TOKEN ? 'YES' : 'NO');
console.log('PLAUSIBLE API KEY SET:', process.env.REACT_APP_PLAUSIBLE_API_KEY ? 'YES' : 'NO');
console.log('PLAUSIBLE SITE ID:', process.env.REACT_APP_PLAUSIBLE_SITE_ID);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
