import { WeatherData, HistoricalData } from '../types/weather';

const API_URL = 'https://your-server-url.com/api';

export const WeatherService = {
  async getCurrentWeather(): Promise<WeatherData> {
    try {
      // In production, this would be a real API call
      // const response = await fetch(`${API_URL}/weather/current`);
      // if (!response.ok) throw new Error('Failed to fetch weather data');
      // return await response.json();
      
      // For demonstration, return mock data
      return mockCurrentWeather();
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },
  
  async getHistoricalData(date: string): Promise<HistoricalData[]> {
    try {
      // In production, this would be a real API call
      // const response = await fetch(`${API_URL}/weather/historical?date=${date}`);
      // if (!response.ok) throw new Error('Failed to fetch historical data');
      // return await response.json();
      
      // For demonstration, return mock data
      return mockHistoricalData(date);
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw error;
    }
  },
  
  async downloadData(startDate: string, endDate: string): Promise<Blob> {
    try {
      // In production, this would be a real API call
      // const response = await fetch(
      //   `${API_URL}/weather/download?startDate=${startDate}&endDate=${endDate}`
      // );
      // if (!response.ok) throw new Error('Failed to download data');
      // return await response.blob();
      
      // For demonstration, return a mock CSV
      const csvContent = "timestamp,temperature,humidity,pressure,rainDetection,lightIntensity,uvIndex,windSpeed,windDirection,noiseLevel,airQuality\n";
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return blob;
    } catch (error) {
      console.error('Error downloading weather data:', error);
      throw error;
    }
  }
};

// Mock data functions
function mockCurrentWeather(): WeatherData {
  return {
    temperature: 22 + Math.random() * 8,
    humidity: 50 + Math.random() * 30,
    pressure: 1010 + Math.random() * 10,
    rainDetection: Math.random() > 0.8,
    lightIntensity: Math.random() * 1000,
    uvIndex: Math.random() * 10,
    windSpeed: Math.random() * 15,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    noiseLevel: 30 + Math.random() * 30,
    airQuality: 20 + Math.random() * 60,
    timestamp: new Date().toISOString()
  };
}

function mockHistoricalData(date: string): HistoricalData[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const baseTemp = 20 + Math.sin(i / 24 * Math.PI * 2) * 8;
    const baseHumidity = 60 + Math.sin(i / 24 * Math.PI * 2 + Math.PI) * 20;
    
    return {
      timestamp: new Date(date + 'T' + hour.toString().padStart(2, '0') + ':00:00').toISOString(),
      temperature: baseTemp + (Math.random() * 2 - 1),
      humidity: baseHumidity + (Math.random() * 5 - 2.5),
      pressure: 1013 + Math.sin(i / 24 * Math.PI * 2) * 5,
      rainDetection: Math.random() > 0.8,
      lightIntensity: hour >= 6 && hour <= 18 ? 500 * Math.sin((hour - 6) / 12 * Math.PI) : 0,
      uvIndex: hour >= 8 && hour <= 16 ? 6 * Math.sin((hour - 8) / 8 * Math.PI) : 0,
      windSpeed: 5 + Math.random() * 10,
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      noiseLevel: 30 + Math.random() * 20,
      airQuality: 30 + Math.random() * 30
    };
  });
}