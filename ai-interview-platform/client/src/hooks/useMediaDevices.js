import { useState, useEffect } from 'react';

export function useMediaDevices() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list);
      } catch (err) {
        console.warn('[Media Devices Hook Warning] Could not enumerate devices:', err.message);
      }
    };
    getDevices();
  }, []);

  return devices;
}
