import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WeatherData from './WeatherData';
import CameraCapture from './CameraCapture';
import HistoricalData from './HistoricalData';
import {
  CloudSun,
  BarChart2,
  Camera,
  Download,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center p-4 bg-blue-800 border-b border-blue-700">
        <div className="flex items-center space-x-2">
          <CloudSun className="h-6 w-6 text-yellow-400" />
          <span className="font-bold">Weather Station</span>
        </div>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-md bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 fixed md:static inset-0 z-10 w-64 bg-blue-800/95 md:bg-blue-800 overflow-y-auto md:block p-4 border-r border-blue-700`}
      >
        <div className="flex items-center justify-center mb-8 mt-4">
          <CloudSun className="h-8 w-8 text-yellow-400 mr-2" />
          <h1 className="text-xl font-bold">Weather Station</h1>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-700/50'
              }`
            }
          >
            <CloudSun className="h-5 w-5 mr-3" />
            Current Weather
          </NavLink>

          <NavLink
            to="/dashboard/historical"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-700/50'
              }`
            }
          >
            <BarChart2 className="h-5 w-5 mr-3" />
            Historical Data
          </NavLink>

          <NavLink
            to="/dashboard/camera"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-700/50'
              }`
            }
          >
            <Camera className="h-5 w-5 mr-3" />
            Camera Capture
          </NavLink>

          <NavLink
            to="/dashboard/downloads"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-700/50'
              }`
            }
          >
            <Download className="h-5 w-5 mr-3" />
            Download Data
          </NavLink>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 bg-blue-900/50 p-4 md:p-6 overflow-y-auto"
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        <Routes>
          <Route path="/" element={<WeatherData />} />
          <Route path="/historical" element={<HistoricalData />} />
          <Route path="/camera" element={<CameraCapture />} />
          <Route path="/downloads" element={<DataDownload />} />
        </Routes>
      </main>
    </div>
  );
};

const DataDownload: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Download Weather Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DownloadCard 
          title="Today's Data" 
          description="Download all weather data recorded today"
          buttonText="Download Today's Data"
          onClick={() => console.log("Downloading today's data")}
        />
        
        <DownloadCard 
          title="Last Hour" 
          description="Download weather data from the past hour"
          buttonText="Download Last Hour"
          onClick={() => console.log("Downloading last hour's data")}
        />
        
        <DownloadCard 
          title="Last 10 Minutes" 
          description="Download the most recent 10 minutes of data"
          buttonText="Download Recent Data"
          onClick={() => console.log("Downloading last 10 minutes of data")}
        />
        
        <DownloadCard 
          title="Past 7 Days" 
          description="Download all available historical data (7 days)"
          buttonText="Download All Data"
          onClick={() => console.log("Downloading all data")}
        />
        
        <DownloadCard 
          title="Custom Range" 
          description="Select a specific date range to download"
          buttonText="Select Range"
          onClick={() => console.log("Custom range selection")}
          isCustom
        />
      </div>
    </div>
  );
};

interface DownloadCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  isCustom?: boolean;
}

const DownloadCard: React.FC<DownloadCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  onClick,
  isCustom 
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all shadow-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-blue-200 mb-4">{description}</p>
      
      {isCustom ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input 
              type="date" 
              className="w-full bg-blue-800/50 border border-blue-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input 
              type="date" 
              className="w-full bg-blue-800/50 border border-blue-700 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      ) : null}
      
      <button
        onClick={onClick}
        className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors duration-300 flex items-center justify-center"
      >
        <Download className="h-4 w-4 mr-2" />
        {buttonText}
      </button>
    </div>
  );
};

export default Dashboard;