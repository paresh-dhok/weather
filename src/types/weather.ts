export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  rainDetection: boolean;
  lightIntensity: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: string;
  noiseLevel: number;
  airQuality: number;
  timestamp: string;
}

export interface HistoricalData extends WeatherData {
  // Same as WeatherData, but used for historical records
}