import { CameraImage } from '../types/camera';

const API_URL = 'https://your-server-url.com/api';

export const CameraService = {
  async captureImage(): Promise<CameraImage> {
    try {
      // In production, this would be a real API call
      // const response = await fetch(`${API_URL}/camera/capture`, {
      //   method: 'POST'
      // });
      // if (!response.ok) throw new Error('Failed to capture image');
      // return await response.json();
      
      // For demonstration, return mock data
      return mockCaptureImage();
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  }
};

// Mock data function
function mockCaptureImage(): CameraImage {
  // Using a placeholder image for demonstration
  return {
    imageUrl: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    timestamp: new Date().toISOString()
  };
}