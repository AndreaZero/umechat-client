import { useState, useEffect } from 'react';

const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title, options = {}) => {
    if (permission !== 'granted' || !isSupported) return;

    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'ume-chat',
      requireInteraction: false,
      silent: false,
      ...options
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification
  };
};

export default useNotifications;
