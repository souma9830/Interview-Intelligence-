
export function getAuthHeader() {
  const token = localStorage.getItem('camsense_token');
  if (token && token.trim()) {
    return { Authorization: 'Bearer ' + token };
  }
  return { Authorization: 'Bearer demo_token_active' };
}
  