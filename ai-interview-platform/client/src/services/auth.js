import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const signupUser = async (userData) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const sendPasswordReset = async (email) => {
  return sendPasswordResetEmail(auth, email, {
    url: window.location.origin,
    handleCodeInApp: false,
  });
};
