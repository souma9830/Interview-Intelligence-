export function getAuthHeader() {
  const token = localStorage.getItem('camsense_token');
  if (token && token.trim()) {
    return { Authorization: 'Bearer ' + token };
  }
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_ALLOW_DEMO_TOKEN === 'true') {
    return { Authorization: 'Bearer demo_token_active' };
  }
  return {};
}
