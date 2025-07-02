/**
 * Network client specifically optimized for React Native
 * This handles Android's networking quirks and SSL pinning issues
 */

import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Create a custom axios instance with optimized settings for React Native
const client = axios.create({
  timeout: 30000, // 30 second timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor to automatically add valid tokens
client.interceptors.request.use(
  async (config) => {
    // Check for network connectivity first
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    
    // For Supabase endpoints, add the session token
    if (config.url?.includes('supabase.co')) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          config.headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
      } catch (err) {
        console.error('Failed to get auth session:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common React Native issues
client.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle network errors specifically
    if (error.message === 'Network Error') {
      console.error('Network error detected - this is common on Android when SSL issues occur');
      return Promise.reject({
        ...error,
        message: 'Network connection issue - please check your internet connection or try on a different network'
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout detected');
      return Promise.reject({
        ...error,
        message: 'Request timed out - please try again or check your connection'
      });
    }
    
    // Handle auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Authentication error detected:', error.response?.data);
      return Promise.reject({
        ...error,
        message: 'Authentication failed - please log in again'
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Check if the device is connected to the internet
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false;
  }
};

/**
 * Refresh the authentication token if needed
 */
export const ensureFreshToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      console.error('No active session found');
      return null;
    }
    
    // Check if token is about to expire (within 5 minutes)
    const expiresAt = data.session.expires_at || 0;
    const isExpiringSoon = (expiresAt * 1000) - Date.now() < 300000;
    
    if (isExpiringSoon) {
      console.log('Token is expiring soon, refreshing...');
      const { data: refreshData, error } = await supabase.auth.refreshSession();
      if (error || !refreshData.session) {
        console.error('Failed to refresh token:', error);
        return null;
      }
      return refreshData.session.access_token;
    }
    
    return data.session.access_token;
  } catch (error) {
    console.error('Error ensuring fresh token:', error);
    return null;
  }
};

/**
 * Enhanced fetch with better error handling for React Native
 */
export const enhancedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Check network before attempting fetch
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    
    // Add authentication header for Supabase URLs if needed
    if (url.includes('supabase.co') && !options.headers?.hasOwnProperty('Authorization')) {
      const token = await ensureFreshToken();
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.error('Enhanced fetch error:', error);
    
    // Improve error message for common issues
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    
    if (error.message.includes('Network request failed')) {
      throw new Error('Network connection issue. Please check your internet connection.');
    }
    
    throw error;
  }
};

/**
 * Upload a file directly using FormData and fetch
 * This approach works better on React Native than the Supabase SDK
 */
export const uploadFileWithFormData = async (
  url: string,
  fileUri: string,
  fileName: string,
  fileType: string,
  headers: Record<string, string> = {}
): Promise<Response> => {
  try {
    // Check network first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    
    console.log('Creating FormData for upload');
    const formData = new FormData();
    
    // Create a file object compatible with FormData in React Native
    // @ts-ignore - React Native typing differences
    const fileObject = {
      uri: fileUri,
      name: fileName,
      type: fileType
    };
    
    // Add the file to form data
    // @ts-ignore - React Native typing differences
    formData.append('file', fileObject);
    
    console.log('Sending upload request to:', url);
    
    // If it's a Supabase URL, ensure we have a fresh token
    if (url.includes('supabase.co') && !headers.hasOwnProperty('Authorization')) {
      const token = await ensureFreshToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Use our enhanced fetch for the upload
    const response = await enhancedFetch(url, {
      method: 'POST', // Using POST is more reliable for FormData in React Native
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...headers
      }
    });
    
    console.log('Upload response status:', response.status);
    
    // Improved error handling
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Upload response error:', errorText);
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('FormData upload error:', error);
    throw error;
  }
};

export default client; 