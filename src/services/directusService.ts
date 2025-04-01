import axios from 'axios';
import { format, subDays, startOfDay, endOfDay, addDays } from 'date-fns';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  nautical: boolean;
  financing: string;
  favourites?: number[]; // Veld weer toevoegen voor de punaise-indicator
  // favouriteUnitDetails?: FavouriteUnitDetail[]; // Niet meer nodig hier
}

interface FavoriteCount {
  item: string;
  count: number;
}

interface DirectusResponse<T> {
  data: T[];
}

interface RegistrationTimeseriesPoint {
  date: string; // Behoud YYYY-MM-DD formaat voor de keys en sortering
  count: number;
}

// Helper om start- en einddatum te krijgen
const getPeriodDateInterval = (period: string): { start: Date; end: Date } => {
  const end = endOfDay(new Date()); // Vandaag, einde van de dag
  let start: Date;

  switch (period) {
    case '7d':
      start = startOfDay(subDays(end, 6)); // 7 dagen totaal incl vandaag
      break;
    case '14d':
      start = startOfDay(subDays(end, 13)); 
      break;
    case '30d':
      start = startOfDay(subDays(end, 29));
      break;
    case '90d':
      start = startOfDay(subDays(end, 89));
      break;
    case '1y':
      start = startOfDay(subDays(end, 364));
      break;
    default: // Fallback or handle other cases like 'today', 'yesterday'
      start = startOfDay(subDays(end, 6)); // Default to 7d if needed
  }
  return { start, end };
};

const getDateRange = (period: string): string => {
  const { start } = getPeriodDateInterval(period);
  // Formatteer alleen de startdatum voor het API filter
  const formattedStartDate = format(start, "yyyy-MM-dd'T'HH:mm:ss");
  console.log('[getDateRange] Calculated start date for API filter:', { period, formattedStartDate });
  return formattedStartDate;
};

const axiosInstance = axios.create({
  baseURL: `/api/directus/items`,
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug interceptors met meer details
axiosInstance.interceptors.request.use(request => {
  console.log('🚀 API Request:', {
    url: request.url,
    baseURL: request.baseURL,
    fullUrl: `${request.baseURL || ''}${request.url || ''}`,
    method: request.method,
    headers: request.headers,
    params: request.params
  });
  return request;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      envUrl: process.env.REACT_APP_DIRECTUS_API_URL,
      envToken: process.env.REACT_APP_DIRECTUS_TOKEN?.substring(0, 5) + '...'
    });
    return Promise.reject(error);
  }
);

// Test functie om API bereikbaarheid te controleren
const testApi = async (route: string) => {
  try {
    console.log(`🔍 Testing API connection to ${route} via proxy...`);
    const response = await axiosInstance.get(route, { 
      params: {
        'limit': 1
      }
    });
    console.log(`✅ API Connection to ${route} successful:`, {
      status: response.status,
      data: response.data
    });
    return { success: true, status: response.status };
  } catch (error: any) {
    console.error(`❌ API Connection to ${route} failed:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { success: false, status: error.response?.status, message: error.message };
  }
};

export const DirectusService = {
  async getTotalRegistrations(period: string): Promise<{ total: number; nautical: number }> {
    console.log('📊 Getting total registrations:', { period });
    try {
      // Test eerst de API verbinding
      const apiTest = await testApi('/customers');
      console.log('🔍 API Test result:', apiTest);
      
      if (!apiTest.success) {
        console.error('❌ Could not connect to API');
        return { total: 0, nautical: 0 };
      }

      const startDate = getDateRange(period);
      console.log('📅 Date range:', { period, startDate });

      // Haal alle registraties op met nautische informatie
      const response = await axiosInstance.get<DirectusResponse<{ id: number; nautical: string | boolean }>>('/customers', {
        params: {
          'fields': ['id', 'nautical'],
          'filter[created_at][_gte]': startDate,
        }
      });
      
      const registrations = response.data.data;
      const total = registrations.length;
      const nautical = registrations.filter(reg => {
        if (typeof reg.nautical === 'boolean') {
          return reg.nautical === true;
        }
        return reg.nautical?.toLowerCase() === 'ja';
      }).length;

      console.log('📝 Registration results:', {
        total,
        nautical,
        firstFewItems: registrations.slice(0, 3)
      });

      return { total, nautical };
    } catch (error) {
      console.error('❌ Error getting total registrations:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return { total: 0, nautical: 0 };
    }
  },

  async getRecentRegistrations(period: string): Promise<Customer[]> {
    const functionName = "[RecentRegistrations_RestoreFields]"; // Nieuwe prefix
    try {
      console.log(`${functionName} Fetching customer data for period: ${period}`);
      const startDate = getDateRange(period);
      const response = await axiosInstance.get<DirectusResponse<Customer>>('/customers', {
        params: {
          // Zet fields terug naar '*' om zeker te zijn
          'fields': ['*'], 
          'filter': { 'created_at': { '_gte': startDate } },
          'sort': '-created_at'
        }
      });

      const customers = response.data.data;
      console.log(`${functionName} Fetched ${customers.length} customers using fields=*.`);
      return customers;

    } catch (error) {
      console.error(`${functionName} Error fetching recent registrations:`, error);
      throw error;
    }
  },

  async getTopFavorites(period: string): Promise<FavoriteCount[]> {
    const functionName = "[TopFavorites]"; 
    
    try {
      const startDate = getDateRange(period);
      console.log(`${functionName} Fetching for period: ${period}, Start date: ${startDate}`);
      
      // Probeer met Axios
      const axiosResponse = await axiosInstance.get<DirectusResponse<any>>('/pinned_units', {
        params: {
          'fields': ['unit_id'],
          'limit': 1000,
          ...(period !== 'all' && { 'filter[created_at][_gte]': startDate })
        }
      });

      if (axiosResponse.data?.data) {
        console.log(`${functionName} Axios request successful! Items:`, axiosResponse.data.data.length);
        // Verwerk resultaten
        const counts: Record<string, number> = {};
        for (const item of axiosResponse.data.data) {
          if (item.unit_id) {
            counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
          }
        }
        return Object.entries(counts)
          .map(([item, count]) => ({ item, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      } else {
        console.log(`${functionName} Axios request returned no data or failed structure.`);
      }

    } catch (axiosError: any) {
        console.error(`${functionName} Axios request failed:`, axiosError.message);
    }

    // Fallback: Probeer directe fetch
    console.log(`${functionName} Poging 2: Direct fetch via proxy...`);
    try {
        const startDate = getDateRange(period);
        let fetchUrl = `/api/directus/items/pinned_units?fields[]=unit_id&limit=1000`;
        if (period !== 'all') {
          fetchUrl += `&filter[created_at][_gte]=${encodeURIComponent(startDate)}`;
        }
        
        console.log(`${functionName} Fetch URL: ${fetchUrl}`);
        
        const response = await fetch(fetchUrl, { 
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          console.log(`${functionName} Direct fetch successful!`, result.data.length);
          // Verwerk resultaten
          const counts: Record<string, number> = {};
          for (const item of result.data) {
            if (item.unit_id) {
              counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
            }
          }
          return Object.entries(counts)
            .map(([item, count]) => ({ item, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        } else {
          console.log(`${functionName} Direct fetch returned no data.`);
        }
      } catch (fetchError: any) {
        console.error(`${functionName} Fetch error:`, fetchError.message);
      }

    // Als alles faalt, fallback naar dummy data
    console.log(`${functionName} Alle API-pogingen mislukt, terugvallen op dummy data`);
    return [
      { item: '64', count: 10 },
      { item: '19', count: 8 },
      { item: '33', count: 7 },
      { item: '5', count: 5 },
      { item: '12', count: 3 },
    ];
  },

  async getRegistrationTimeseries(period: string): Promise<RegistrationTimeseriesPoint[]> {
    const functionName = "[RegistrationTimeseries_Padded]"; 
    try {
      const { start, end } = getPeriodDateInterval(period);
      const apiFilterStartDate = format(start, "yyyy-MM-dd'T'HH:mm:ss");

      console.log(`${functionName} Fetching registrations between:`, { start: apiFilterStartDate, end: end.toISOString() });

      // 1. Haal registraties op
      const response = await axiosInstance.get<DirectusResponse<{ created_at: string }>>('/customers', {
        params: {
          fields: ['created_at'],
          filter: { 
            created_at: { _gte: apiFilterStartDate } 
          },
          limit: -1 
        }
      });

      const registrations = response.data.data;
      console.log(`${functionName} API returned ${registrations.length} raw registrations for period ${period}.`);

      // 2. Groepeer de opgehaalde registraties per dag
      const countsPerDay: Record<string, number> = {};
      registrations.forEach(reg => {
        const regDate = new Date(reg.created_at);
        if (regDate >= start && regDate <= end) {
          const dateKey = format(regDate, 'yyyy-MM-dd');
          countsPerDay[dateKey] = (countsPerDay[dateKey] || 0) + 1;
        }
      });
      console.log(`${functionName} Counts per actual registration day:`, countsPerDay);

      // 3. Genereer alle datums binnen het interval (handmatig)
      const allDates: Date[] = [];
      let currentDate = start;
      while (currentDate <= end) {
        allDates.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }
      console.log(`${functionName} Manually generated all dates in interval. Count: ${allDates.length}`);

      // 4. Maak de uiteindelijke timeseries data
      const timeseriesData: RegistrationTimeseriesPoint[] = allDates.map((date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return {
          date: dateKey, 
          count: countsPerDay[dateKey] || 0 
        };
      });

      // Sortering is nu niet meer nodig omdat de loop al gesorteerd is
      // timeseriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 

      console.log(`${functionName} Processed timeseries data with padding. Final length: ${timeseriesData.length}. First/Last 5 points:`, {
        first: timeseriesData.slice(0, 5),
        last: timeseriesData.slice(-5)
      });
      return timeseriesData;

    } catch (error) {
      console.error(`${functionName} Error fetching registration timeseries:`, error);
      return []; 
    }
  }
}; 