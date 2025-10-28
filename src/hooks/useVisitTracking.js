import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import useDeviceDetection from './useDeviceDetection';

const useVisitTracking = () => {
  const [visitData, setVisitData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitCount, setVisitCount] = useState(0);
  const { isMobile, isIOS, isAndroid } = useDeviceDetection();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        setIsLoading(true);
        
        // Controlla se è la prima visita di oggi
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem('ume-last-visit-date');
        const isNewDay = lastVisitDate !== today;
        
        // Ottieni IP e dati geografici
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Determina il tipo di dispositivo
        let deviceType = 'desktop';
        if (isMobile) {
          deviceType = isIOS ? 'ios' : isAndroid ? 'android' : 'mobile';
        }

        // Prepara i dati della visita
        const visitInfo = {
          ip: data.ip,
          country: data.country_name,
          city: data.city,
          region: data.region,
          timezone: data.timezone,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          deviceType: deviceType,
          isNewDay: isNewDay
        };
        
        // Aggiorna il contatore locale
        if (isNewDay) {
          const currentCount = parseInt(localStorage.getItem('ume-visit-count') || '0');
          const newCount = currentCount + 1;
          localStorage.setItem('ume-visit-count', newCount.toString());
          localStorage.setItem('ume-last-visit-date', today);
          setVisitCount(newCount);
        } else {
          setVisitCount(parseInt(localStorage.getItem('ume-visit-count') || '0'));
        }
        
        setVisitData(visitInfo);
        
        // Opzionalmente invia al server (se implementato)
        try {
          await fetch(`${API_URL}/api/track-visit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(visitInfo)
          });
        } catch (serverError) {
          // Il server potrebbe non essere configurato, non è un errore critico
          console.log('Server tracking non disponibile:', serverError.message);
        }
        
      } catch (error) {
        console.error('Errore nel tracking visite:', error);
        setError(error.message);
        
        // Fallback: almeno conta le visite localmente
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem('ume-last-visit-date');
        const isNewDay = lastVisitDate !== today;
        
        if (isNewDay) {
          const currentCount = parseInt(localStorage.getItem('ume-visit-count') || '0');
          const newCount = currentCount + 1;
          localStorage.setItem('ume-visit-count', newCount.toString());
          localStorage.setItem('ume-last-visit-date', today);
          setVisitCount(newCount);
        } else {
          setVisitCount(parseInt(localStorage.getItem('ume-visit-count') || '0'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    trackVisit();
  }, []);

  return {
    visitData,
    visitCount,
    isLoading,
    error,
    isFirstVisit: visitCount === 1
  };
};

export default useVisitTracking;
