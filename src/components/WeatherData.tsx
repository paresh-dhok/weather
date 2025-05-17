import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  CloudRain, 
  Sun, 
  Wind, 
  Volume2,
  RefreshCw
} from 'lucide-react';
import { WeatherService } from '../services/WeatherService';
import { WeatherData as WeatherDataType } from '../types/weather';

const WeatherData: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await WeatherService.getCurrentWeather();
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Poll for new data every 60 seconds
    const intervalId = setInterval(fetchWeatherData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // For demo purposes, create mock data if no actual data is available
  const mockData: WeatherDataType = {
    temperature: 25.7,
    humidity: 65.3,
    pressure: 1013.2,
    rainDetection: false,
    lightIntensity: 450,
    uvIndex: 3.4,
    windSpeed: 8.5,
    windDirection: 'NE',
    noiseLevel: 42.3,
    airQuality: 35.5,
    timestamp: new Date().toISOString()
  };

  const displayData = weatherData || mockData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">Current Weather Conditions</h2>
        
        <div className="flex items-center mt-2 sm:mt-0">
          {lastUpdated && (
            <span className="text-sm text-blue-200 mr-3">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <button 
            onClick={fetchWeatherData}
            disabled={loading}
            className={`flex items-center px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <WeatherCard 
          title="Temperature" 
          value={`${displayData.temperature.toFixed(1)}°C`}
          icon={<Thermometer className="h-6 w-6 text-red-400" />}
          color="from-orange-500/20 to-red-500/20"
        />
        
        <WeatherCard 
          title="Humidity" 
          value={`${displayData.humidity.toFixed(1)}%`}
          icon={<Droplets className="h-6 w-6 text-blue-400" />}
          color="from-blue-500/20 to-cyan-500/20"
        />
        
        <WeatherCard 
          title="Pressure" 
          value={`${displayData.pressure.toFixed(1)} hPa`}
          icon={<Gauge className="h-6 w-6 text-purple-400" />}
          color="from-purple-500/20 to-indigo-500/20"
        />
        
        <WeatherCard 
          title="Rain" 
          value={displayData.rainDetection ? 'Detected' : 'None'}
          icon={<CloudRain className="h-6 w-6 text-blue-400" />}
          color="from-blue-500/20 to-indigo-500/20"
        />
        
        <WeatherCard 
          title="Light Intensity" 
          value={`${displayData.lightIntensity} lux`}
          icon={<Sun className="h-6 w-6 text-yellow-400" />}
          color="from-yellow-500/20 to-amber-500/20"
        />
        
        <WeatherCard 
          title="UV Index" 
          value={displayData.uvIndex.toFixed(1)}
          icon={<Sun className="h-6 w-6 text-orange-400" />}
          color="from-orange-500/20 to-amber-500/20"
        />
        
        <WeatherCard 
          title="Wind Speed" 
          value={`${displayData.windSpeed.toFixed(1)} m/s`}
          icon={<Wind className="h-6 w-6 text-blue-400" />}
          color="from-blue-500/20 to-cyan-500/20"
        />
        
        <WeatherCard 
          title="Wind Direction" 
          value={displayData.windDirection}
          icon={<Wind className="h-6 w-6 text-blue-400" />}
          color="from-blue-500/20 to-cyan-500/20"
        />
        
        <WeatherCard 
          title="Noise Level" 
          value={`${displayData.noiseLevel.toFixed(1)} dB`}
          icon={<Volume2 className="h-6 w-6 text-purple-400" />}
          color="from-purple-500/20 to-pink-500/20"
        />
        
        <WeatherCard 
          title="Air Quality" 
          value={`AQI ${displayData.airQuality.toFixed(0)}`}
          icon={<Gauge className="h-6 w-6 text-green-400" />}
          color="from-green-500/20 to-emerald-500/20"
        />
      </div>
    </div>
  );
};

interface WeatherCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-gradient-to-br ${color} backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-lg">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};

export default WeatherData;