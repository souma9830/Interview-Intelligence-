import axios from 'axios';
import { auth } from '../../firebase';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically inject the Firebase auth token
API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const startSession = async (params, signal) => {
  const response = await API.post('/interview/session/start', params, { signal });
  return response.data;
};

export const submitAnswer = async (answerData, signal) => {
  const response = await API.post('/interview/session/answer', answerData, { signal });
  return response.data;
};

export default API;
