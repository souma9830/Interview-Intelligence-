import React from 'react';

export default function GuestRoute({ token, children, setCurrentTab }) {
  React.useEffect(() => {
    if (token) {
      setCurrentTab('home');
    }
  }, [token, setCurrentTab]);

  if (token) return null;
  return children;
}
