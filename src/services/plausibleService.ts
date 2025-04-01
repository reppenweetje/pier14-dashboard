import axios from 'axios';

const API_KEY = process.env.REACT_APP_PLAUSIBLE_API_KEY;
const SITE_ID = process.env.REACT_APP_PLAUSIBLE_SITE_ID;
const BASE_URL = process.env.REACT_APP_PLAUSIBLE_API_URL;

const plausibleApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export interface AnalyticsMetrics {
  pageviews: number;
  visitors: number;
  bounceRate: number;
  visitDuration: number;
}

export const PlausibleService = {
  async getMetrics(period: string = '30d'): Promise<AnalyticsMetrics> {
    try {
      const response = await plausibleApi.get(`/stats/aggregate`, {
        params: {
          site_id: SITE_ID,
          period,
          metrics: 'pageviews,visitors,bounce_rate,visit_duration',
        },
      });

      return {
        pageviews: response.data.results.pageviews.value,
        visitors: response.data.results.visitors.value,
        bounceRate: response.data.results.bounce_rate.value,
        visitDuration: response.data.results.visit_duration.value,
      };
    } catch (error) {
      console.error('Error fetching Plausible metrics:', error);
      throw error;
    }
  },

  async getTimeseriesData(period: string = '30d') {
    try {
      const response = await plausibleApi.get(`/stats/timeseries`, {
        params: {
          site_id: SITE_ID,
          period,
          metrics: 'visitors,pageviews',
        },
      });

      return response.data.results;
    } catch (error) {
      console.error('Error fetching Plausible timeseries data:', error);
      throw error;
    }
  },
}; 