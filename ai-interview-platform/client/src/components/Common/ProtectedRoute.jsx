import React from 'react';

export default function ProtectedRoute({ token, children, setCurrentTab }) {
  React.useEffect(() => {
    if (!token) {
      setCurrentTab('login');
    }
  }, [token, setCurrentTab]);

  if (!token) return null;
  return children;
}
