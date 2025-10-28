import { useState, useEffect } from 'react';

const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const detectDevice = () => {
      // Rileva se è un dispositivo mobile
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(navigator.userAgent);
      setIsMobile(isMobileDevice);

      // Rileva iOS
      const iOSRegex = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOSRegex);

      // Rileva Android
      const androidRegex = /Android/.test(navigator.userAgent);
      setIsAndroid(androidRegex);

      // Rileva se l'app è già installata come PWA
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    detectDevice();

    // Ascolta i cambiamenti del display mode (per quando l'app viene installata)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => setIsStandalone(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isStandalone,
    canInstallPWA: isMobile && !isStandalone
  };
};

export default useDeviceDetection;
