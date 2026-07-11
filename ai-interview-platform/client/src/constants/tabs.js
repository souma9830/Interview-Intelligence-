export const TABS = {
  LANDING: 'landing',
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT_PASSWORD: 'forgot-password',
  VERIFY_OTP: 'verify-otp',
  HOME: 'home',
  DASHBOARD: 'dashboard',
  SCHEDULE: 'schedule',
  SETUP: 'setup',
  SESSION: 'session',
  CODING: 'coding',
  RESULT: 'result',
  ERRORS: 'errors',
};

export const AUTH_TABS = new Set([
  TABS.LANDING,
  TABS.LOGIN,
  TABS.SIGNUP,
  TABS.FORGOT_PASSWORD,
  TABS.VERIFY_OTP,
]);

export const PROTECTED_TABS = new Set([
  TABS.HOME,
  TABS.DASHBOARD,
  TABS.SCHEDULE,
  TABS.SETUP,
  TABS.SESSION,
  TABS.CODING,
  TABS.RESULT,
  TABS.ERRORS,
]);

export const VALID_TABS = new Set([...AUTH_TABS, ...PROTECTED_TABS]);
