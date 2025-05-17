import React, { useState } from 'react';
import { CameraService } from '../services/CameraService';
import { Camera, Loader, RefreshCw, Download, Trash2 } from 'lucide-react';

const CameraCapture: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureTime, setCaptureTime] = useState<Date | null>(null);

  const captureImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const imageData = await CameraService.captureImage();
      setImageUrl(imageData.imageUrl);
      setCaptureTime(new Date());
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `Weather_Station_Image_${new Date().toISOString().replace(/:/g, '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clear the image after download
    setImageUrl(null);
    setCaptureTime(null);
  };

  const discardImage = () => {
    setImageUrl(null);
    setCaptureTime(null);
  };

  // For demo purposes
  const mockImageUrl = "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Camera Capture</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-semibold">ESP32-CAM Control</h3>
            <p className="text-blue-200 mt-1">Capture a photo from your weather station camera</p>
          </div>
          
          <button
            onClick={captureImage}
            disabled={loading}
            className={`flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <Loader className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Camera className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Capturing...' : 'Capture Photo'}
          </button>
        </div>
      </div>
      
      {(imageUrl || mockImageUrl) && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Camera Image</h3>
              {captureTime && (
                <div className="text-sm text-blue-200">
                  Captured at: {captureTime.toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="relative rounded-lg overflow-hidden bg-black/20 flex items-center justify-center p-2">
              <img 
                src={imageUrl || mockImageUrl} 
                alt="Weather Station Camera" 
                className="max-w-full max-h-[500px] rounded object-contain"
              />
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={discardImage}
                className="flex items-center px-4 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-md transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Discard
              </button>
              
              <button
                onClick={downloadImage}
                className="flex items-center px-4 py-2 bg-green-600/30 hover:bg-green-600/50 rounded-md transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!imageUrl && !loading && !mockImageUrl && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-10 border border-white/10 flex flex-col items-center justify-center text-center">
          <Camera className="h-16 w-16 text-blue-300 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Image Captured</h3>
          <p className="text-blue-200 mb-4">Click the Capture Photo button to take a photo from your weather station camera</p>
          <button
            onClick={captureImage}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Capture Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;