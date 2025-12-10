import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60 seconds for model processing
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Upload and detect image
export const detectImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error('Detection error:', error);
    throw error.response?.data || { error: 'Failed to analyze image' };
  }
};

// Get detection history
export const getHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/history', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('History fetch error:', error);
    throw error.response?.data || { error: 'Failed to fetch history' };
  }
};

// Get single detection by ID
export const getDetectionById = async (id) => {
  try {
    const response = await api.get(`/history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Detection fetch error:', error);
    throw error.response?.data || { error: 'Failed to fetch detection' };
  }
};

// Delete a detection record
export const deleteDetection = async (id) => {
  try {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error.response?.data || { error: 'Failed to delete detection' };
  }
};

// Get detection statistics
export const getStats = async () => {
  try {
    const response = await api.get('/history/stats');
    return response.data;
  } catch (error) {
    console.error('Stats fetch error:', error);
    throw error.response?.data || { error: 'Failed to fetch statistics' };
  }
};

export default api;
