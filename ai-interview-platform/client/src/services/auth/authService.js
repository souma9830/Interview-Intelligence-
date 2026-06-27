import API from '../api';

/**
 * Handle candidates credentials login.
 */
export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

/**
 * Create new candidate account.
 */
export const signupUser = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  return response.data;
};
