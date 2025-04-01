export const API_CONFIG = {
  PLAUSIBLE: {
    BASE_URL: process.env.REACT_APP_PLAUSIBLE_API_URL || 'https://plausible.io/api/v1',
    API_KEY: process.env.REACT_APP_PLAUSIBLE_API_KEY,
    SITE_ID: process.env.REACT_APP_PLAUSIBLE_SITE_ID,
  },
  DIRECTUS: {
    BASE_URL: process.env.REACT_APP_DIRECTUS_API_URL || 'http://localhost:8055',
    API_KEY: process.env.REACT_APP_DIRECTUS_API_KEY,
  },
};

export const REFRESH_INTERVAL = 30000; // 30 seconds 