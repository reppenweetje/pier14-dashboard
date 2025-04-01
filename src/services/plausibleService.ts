import axios from 'axios';

interface PlausibleMetricValue {
  value: number;
}

interface PlausibleApiResponse {
  results: {
    pageviews: PlausibleMetricValue;
    visitors: PlausibleMetricValue;
    bounce_rate: PlausibleMetricValue;
    visit_duration: PlausibleMetricValue;
  };
}

export interface PlausibleMetrics {
  visitors: number;
  pageviews: number;
  bounce_rate: number;
  visit_duration: number;
  downloads: number;
}

export interface TimeseriesDataPoint {
  date: string;
  visitors: number;
  pageviews: number;
}

export interface DeviceData {
  name: string;
  value: number;
}

export const DEFAULT_PERIOD = '30d';

const API_KEY = process.env.REACT_APP_PLAUSIBLE_API_KEY;
const SITE_ID = process.env.REACT_APP_PLAUSIBLE_SITE_ID;
const BASE_URL = process.env.REACT_APP_PLAUSIBLE_API_URL;

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_PLAUSIBLE_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_PLAUSIBLE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Debug interceptors
axiosInstance.interceptors.request.use(request => {
  console.log('🔍 Plausible Request:', {
    url: request.url,
    fullUrl: `${request.baseURL || ''}${request.url || ''}`,
    method: request.method,
    headers: request.headers,
    params: request.params,
    envUrl: process.env.REACT_APP_PLAUSIBLE_API_URL,
    envToken: process.env.REACT_APP_PLAUSIBLE_TOKEN?.substring(0, 5) + '...',
    siteId: SITE_ID
  });
  return request;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('✅ Plausible Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ Plausible Response Error:', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      envUrl: process.env.REACT_APP_PLAUSIBLE_API_URL,
      envToken: process.env.REACT_APP_PLAUSIBLE_TOKEN?.substring(0, 5) + '...',
      siteId: SITE_ID
    });
    return Promise.reject(error);
  }
);

const getDateRange = (period: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = today.toISOString().split('T')[0]; // Vandaag als einddatum (inclusief)
  
  let startDate: Date;
  let plausiblePeriod: string | null = null;
  let dateRangeString: string | null = null;
  
  switch (period) {
    case 'today':
      return { period: 'day' };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return { date: yesterday.toISOString().split('T')[0] };
    // case '3d':
    //   // Bereken start- en einddatum expliciet
    //   startDate = new Date(today);
    //   startDate.setDate(today.getDate() - 2); // Vandaag, gisteren, eergisteren
    //   dateRangeString = `${startDate.toISOString().split('T')[0]},${endDate}`;
    //   break;
    case '7d':
      plausiblePeriod = '7d';
      break;
    case '14d':
      plausiblePeriod = 'custom';
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 13); // 14 dagen inclusief vandaag
      dateRangeString = `${startDate.toISOString().split('T')[0]},${endDate}`;
      break;
    case '30d':
      plausiblePeriod = '30d';
      break;
    // case '90d':
    //   startDate = new Date(today);
    //   startDate.setDate(today.getDate() - 89); // 90 dagen inclusief vandaag
    //   dateRangeString = `${startDate.toISOString().split('T')[0]},${endDate}`;
    //   break;
    case '1y':
      plausiblePeriod = '12mo';
      break;
    default:
      plausiblePeriod = DEFAULT_PERIOD; // Fallback naar 30d
  }
  
  console.log('Plausible getDateRange (using explicit date for 3d):', { period, plausiblePeriod, dateRangeString });
  
  if (dateRangeString) {
    return { 
      period: 'custom',
      date: dateRangeString 
    };
  }
  
  if (plausiblePeriod) {
    return { period: plausiblePeriod };
  }
  
  // Fallback (zou niet bereikt moeten worden)
  return { period: DEFAULT_PERIOD }; 
};

export const PlausibleService = {
  async getMetrics(period: string = DEFAULT_PERIOD): Promise<PlausibleMetrics> {
    const dateParams = getDateRange(period);
    const finalParamsMetrics = {
      site_id: SITE_ID,
      ...dateParams,
      metrics: 'visitors,pageviews,bounce_rate,visit_duration',
    };
    
    let metricsResponseData: PlausibleApiResponse | null = null;
    try {
      const response = await axios.get<PlausibleApiResponse>(`${BASE_URL}/stats/aggregate`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        params: finalParamsMetrics,
      });
      metricsResponseData = response.data;
    } catch (error) {
      console.error('[PlausibleService] Error fetching base metrics:', error);
      // Standaardwaarden teruggeven bij fout
      return {
        visitors: 0, pageviews: 0, bounce_rate: 0, visit_duration: 0, downloads: 0
      };
    }

    // Downloads ophalen
    const finalParamsDownloads = {
      site_id: SITE_ID,
      ...dateParams,
      filters: 'event:name==File Download',
      metrics: 'visitors',
    };
    let downloads = 0;
    try {
      const downloadsResponse = await axios.get<PlausibleApiResponse>(`${BASE_URL}/stats/aggregate`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        params: finalParamsDownloads,
      });
      downloads = downloadsResponse.data?.results?.visitors?.value || 0;
    } catch (error) {
      console.error('[PlausibleService] Error fetching downloads:', error);
    }

    return {
      pageviews: metricsResponseData?.results.pageviews.value || 0,
      visitors: metricsResponseData?.results.visitors.value || 0,
      bounce_rate: metricsResponseData?.results.bounce_rate.value || 0,
      visit_duration: metricsResponseData?.results.visit_duration.value || 0,
      downloads: downloads,
    };
  },

  async getVisitors(period?: string): Promise<number> {
    const metrics = await this.getMetrics(period);
    return metrics.visitors;
  },

  async getPageviews(period?: string): Promise<number> {
    const metrics = await this.getMetrics(period);
    return metrics.pageviews;
  },

  async getDownloads(period?: string): Promise<number> {
    const metrics = await this.getMetrics(period);
    return metrics.downloads || 0;
  },

  async getTimeseriesData(period: string = DEFAULT_PERIOD): Promise<TimeseriesDataPoint[]> {
    const dateParams = getDateRange(period);
    const finalParams = {
      site_id: SITE_ID,
      ...dateParams,
      metrics: 'visitors,pageviews',
    };
    console.log('[PlausibleService] getTimeseriesData PARAMS:', finalParams);
    
    const response = await axios.get<{ results: TimeseriesDataPoint[] }>(`${BASE_URL}/stats/timeseries`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      params: finalParams,
    });

    return response.data.results;
  },

  async getBrowsersData(period: string = DEFAULT_PERIOD): Promise<DeviceData[]> {
    const dateParams = getDateRange(period);
    const finalParams = {
      site_id: SITE_ID,
      ...dateParams,
      property: 'visit:browser',
      metrics: 'visitors',
    };
    console.log('[PlausibleService] getBrowsersData PARAMS:', finalParams);
    
    try {
      const response = await axios.get<{ results: { browser: string; visitors: number }[] }>(`${BASE_URL}/stats/breakdown`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        params: finalParams,
      });

      console.log('Raw browser response:', response.data);
      const mappedData = response.data.results.map(item => ({
        name: item.browser,
        value: item.visitors
      }));
      console.log('Mapped browser data:', mappedData);
      return mappedData;
    } catch (error: any) {
      console.error('Error fetching browser data:', error);
      if (error?.response?.data) {
        console.error('API Response:', error.response.data);
      }
      return [];
    }
  },

  async getDeviceTypesData(period: string = DEFAULT_PERIOD): Promise<DeviceData[]> {
    const dateParams = getDateRange(period);
    const finalParams = {
      site_id: SITE_ID,
      ...dateParams,
      property: 'visit:device',
      metrics: 'visitors',
    };
    console.log('[PlausibleService] getDeviceTypesData PARAMS:', finalParams);
    
    try {
      const response = await axios.get<{ results: { device: string; visitors: number }[] }>(`${BASE_URL}/stats/breakdown`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        params: finalParams,
      });

      console.log('Raw device response:', response.data);
      const mappedData = response.data.results.map(item => ({
        name: item.device,
        value: item.visitors
      }));
      console.log('Mapped device data:', mappedData);
      return mappedData;
    } catch (error: any) {
      console.error('Error fetching device data:', error);
      if (error?.response?.data) {
        console.error('API Response:', error.response.data);
      }
      return [];
    }
  }
}; 