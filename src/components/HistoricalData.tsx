import React, { useState, useEffect } from 'react';
import { WeatherService } from '../services/WeatherService';
import { HistoricalData as HistoricalDataType } from '../types/weather';
import { Calendar, Clock } from 'lucide-react';

const HistoricalData: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');

  const fetchHistoricalData = async () => {
    setLoading(true);
    
    try {
      const data = await WeatherService.getHistoricalData(selectedDate);
      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedDate]);

  // Mock data for demonstration
  const mockData: HistoricalDataType[] = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const baseTemp = 20 + Math.sin(i / 24 * Math.PI * 2) * 8;
    const baseHumidity = 60 + Math.sin(i / 24 * Math.PI * 2 + Math.PI) * 20;
    
    return {
      timestamp: new Date(selectedDate + 'T' + hour.toString().padStart(2, '0') + ':00:00').toISOString(),
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

  const displayData = historicalData || mockData;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const metrics = [
    { id: 'temperature', label: 'Temperature (°C)' },
    { id: 'humidity', label: 'Humidity (%)' },
    { id: 'pressure', label: 'Pressure (hPa)' },
    { id: 'lightIntensity', label: 'Light (lux)' },
    { id: 'uvIndex', label: 'UV Index' },
    { id: 'windSpeed', label: 'Wind Speed (m/s)' },
    { id: 'noiseLevel', label: 'Noise (dB)' },
    { id: 'airQuality', label: 'Air Quality' }
  ];

  const getValueForMetric = (data: HistoricalDataType, metric: string) => {
    return data[metric as keyof HistoricalDataType];
  };

  const getMaxValueForMetric = (data: HistoricalDataType[], metric: string) => {
    return Math.max(...data.map(item => Number(getValueForMetric(item, metric))));
  };

  const getChartBarHeight = (value: number, maxValue: number) => {
    return value > 0 ? (value / maxValue) * 100 : 0;
  };

  const getMetricColor = (metric: string) => {
    const colors: Record<string, string> = {
      temperature: 'bg-red-500',
      humidity: 'bg-blue-500',
      pressure: 'bg-purple-500',
      lightIntensity: 'bg-yellow-500',
      uvIndex: 'bg-orange-500',
      windSpeed: 'bg-cyan-500',
      noiseLevel: 'bg-pink-500',
      airQuality: 'bg-green-500'
    };
    
    return colors[metric] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Historical Weather Data</h2>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-blue-200" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 bg-blue-800/30 border border-blue-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div className="flex-1">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full bg-blue-800/30 border border-blue-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {metrics.map(metric => (
                <option key={metric.id} value={metric.id}>{metric.label}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={fetchHistoricalData}
            className="bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded-md transition-colors"
          >
            Update Chart
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">{metrics.find(m => m.id === selectedMetric)?.label || selectedMetric}</h3>
          
          <div className="flex min-w-[800px] h-80 items-end space-x-1 pb-6 pt-6 relative">
            {displayData.map((data, index) => {
              const value = Number(getValueForMetric(data, selectedMetric));
              const maxValue = getMaxValueForMetric(displayData, selectedMetric);
              const height = getChartBarHeight(value, maxValue);
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-full ${getMetricColor(selectedMetric)} rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white px-2 py-1 rounded text-xs hidden group-hover:block whitespace-nowrap">
                      {value.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs text-blue-200 mt-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(data.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalData;