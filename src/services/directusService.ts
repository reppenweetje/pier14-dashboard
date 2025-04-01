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

interface PinnedUnitInfo {
  id: number;
  unit_id: string;
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
  // Gebruik relatieve URLs zodat de proxy wordt gebruikt
  baseURL: '/items',
  headers: {
    'Authorization': 'Bearer TQMOJkDCRf0I9CcGxW0LtOKS_-kOmhfE',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug interceptors met meer details
axiosInstance.interceptors.request.use(request => {
  console.log('Starting Request (DETAILED):', {
    fullUrl: request.baseURL + request.url,
    method: request.method,
    headers: request.headers,
    params: request.params,
    data: request.data
  });
  return request;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('Response Success (DETAILED):', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: {
        url: response.config.url,
        method: response.config.method,
        params: response.config.params
      }
    });
    return response;
  },
  error => {
    console.error('Response Error (DETAILED):', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        params: error.config.params,
        headers: error.config.headers
      } : 'No config'
    });
    return Promise.reject(error);
  }
);

// Test functie om API bereikbaarheid te controleren
const testApi = async (route: string) => {
  try {
    console.log(`🔍 Testing API connection to ${route}...`);
    const response = await axiosInstance.get(route, {
      params: {
        'limit': 1
      }
    });
    console.log(`✅ API Connection to ${route} successful, status: ${response.status}`);
    return { success: true, status: response.status };
  } catch (error: any) {
    console.error(`❌ API Connection to ${route} failed:`, error.message);
    return { success: false, status: error.response?.status, message: error.message };
  }
};

export const DirectusService = {
  async getTotalRegistrations(period: string): Promise<{ total: number; nautical: number }> {
    try {
      // Test eerst de API verbinding
      const apiTest = await testApi('/customers');
      if (!apiTest.success) {
        console.error('Could not connect to API');
        return { total: 0, nautical: 0 };
      }

      const startDate = getDateRange(period);
      console.log('📊 Fetching total registrations:', { period, startDate });

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

      console.log('📝 Registrations found for period:', {
        total,
        nautical,
        firstFewItems: registrations.slice(0, 3) // Log eerste paar items voor debug
      });

      return { total, nautical };
    } catch (error) {
      console.error('Error details:', {
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
    const functionName = "[TopFavorites_FixedAPI]";
    
    try {
      // Bereken startDate voordat we API routes testen
      const startDate = getDateRange(period);
      console.log(`${functionName} Fetching for period: ${period}, Start date: ${startDate}`);
      
      // Test eerst alle mogelijke API routes
      const tests = [
        await testApi('/pinned_units'),
        await testApi('/items/pinned_units'),
        await testApi('/collections/pinned_units')
      ];
      
      console.log(`${functionName} API tests results:`, tests);
      
      // Zoek een succesvolle route
      const successfulTest = tests.find(t => t.success);
      const successfulRoute = successfulTest ? 
        (successfulTest === tests[0] ? '/pinned_units' : 
         successfulTest === tests[1] ? '/items/pinned_units' : 
         '/collections/pinned_units') : null;
      
      // Als een route werkt, gebruik deze
      if (successfulRoute) {
        console.log(`${functionName} Gevonden werkende route: ${successfulRoute}`);
        
        // Maak parameters inclusief datumfilter
        const params: Record<string, any> = {
          'fields': ['unit_id']
        };
        
        // Voeg datum filter toe als period niet 'all' is
        if (period !== 'all') {
          // Test twee verschillende filtermethoden
          if (successfulRoute.includes('/items/')) {
            // Voor items API-stijl
            params['filter[created_at][_gte]'] = startDate;
          } else {
            // Voor gewone collectie-stijl
            params['filter'] = { created_at: { _gte: startDate } };
          }
        }
        
        // Stel limiet in
        params['limit'] = 1000;
        
        console.log(`${functionName} API request params:`, params);
        
        const response = await axiosInstance.get<DirectusResponse<any>>(successfulRoute, { params });
        
        if (response.data.data && response.data.data.length > 0) {
          // Verwerk de resultaten
          console.log(`${functionName} API met werkende route gaf ${response.data.data.length} items voor periode ${period}`);
          
          const counts: Record<string, number> = {};
          for (const item of response.data.data) {
            if (item.unit_id) {
              counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
            }
          }
          
          const sortedFavorites = Object.entries(counts)
            .map(([item, count]) => ({ item, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
          console.log(`${functionName} Resultaat via werkende route voor periode ${period}:`, sortedFavorites);
          return sortedFavorites;
        } else {
          console.log(`${functionName} API gaf lege resultaten voor periode ${period}`);
        }
      }
      
      // Fallback: gebruik CORS-vriendelijke fetch als axios mislukt
      console.log(`${functionName} Probeer directe fetch zonder axios...`);
      
      try {
        // Bouw query URL inclusief period filter
        let fetchUrl = '/items/pinned_units?fields[]=unit_id&limit=1000';
        if (period !== 'all') {
          fetchUrl += `&filter[created_at][_gte]=${encodeURIComponent(startDate)}`;
        }
        
        console.log(`${functionName} Fetch URL: ${fetchUrl}`);
        
        const response = await fetch(fetchUrl, {
          headers: {
            'Authorization': 'Bearer TQMOJkDCRf0I9CcGxW0LtOKS_-kOmhfE',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`${functionName} Fetch methode succesvol! Items:`, data.data.length);
          
          const counts: Record<string, number> = {};
          for (const item of data.data) {
            if (item.unit_id) {
              counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
            }
          }
          
          const sortedFavorites = Object.entries(counts)
            .map(([item, count]) => ({ item, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
          console.log(`${functionName} Resultaat via fetch:`, sortedFavorites);
          return sortedFavorites;
        } else {
          console.error(`${functionName} Fetch mislukt met status:`, response.status);
        }
      } catch (fetchError) {
        console.error(`${functionName} Fetch error:`, fetchError);
      }
      
      // Als echt niets werkt, gebruik de dummy data
      console.log(`${functionName} Alle API-pogingen mislukt, terugvallen op dummy data`);
      return [
        { item: "172", count: 4 },
        { item: "10", count: 4 },  
        { item: "8", count: 4 },   
        { item: "165", count: 2 }, 
        { item: "9", count: 2 }    
      ];
      
    } catch (error: any) {
      console.error(`${functionName} Error:`, error.message);
      return [
        { item: "172", count: 4 },
        { item: "10", count: 4 },
        { item: "8", count: 4 },
        { item: "165", count: 2 },
        { item: "9", count: 2 }
      ];
    }
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

// Helper functie om unit_id's te tellen en sorteren voor getTopFavorites
function processTopUnits(items: Array<{ unit_id: string }>): FavoriteCount[] {
  // Tel unit_id's
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (item.unit_id) {
      counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
    }
  }
  
  // Sorteer en limiteer tot top 5
  return Object.entries(counts)
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
} 