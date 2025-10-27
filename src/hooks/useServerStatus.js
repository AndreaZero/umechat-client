import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const useServerStatus = () => {
  const [isServerDown, setIsServerDown] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkServerStatus = async () => {
    try {
      setIsChecking(true);
      const response = await fetch(`${API_URL}/api/videos`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setIsServerDown(false);
        return true;
      } else {
        setIsServerDown(true);
        return false;
      }
    } catch (error) {
      console.log('Server check failed:', error);
      setIsServerDown(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  return {
    isServerDown,
    isChecking,
    checkServerStatus
  };
};

export default useServerStatus;
