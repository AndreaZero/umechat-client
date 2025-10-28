import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const useVisitTracking = () => {
  const [visitData, setVisitData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        setIsLoading(true);
        
        // Controlla se è la prima visita di oggi
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem('ume-last-visit-date');
        const isNewDay = lastVisitDate !== today;
        
        // Ottieni IP e dati geografici - prova prima ipapi.co, poi fallback
        let data;
        try {
          // Per localhost, usa un'API che supporta CORS o un fallback
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          
          if (isLocalhost) {
            // Per localhost, usa ipinfo.io che ha meno restrizioni CORS
            const response = await fetch('https://ipinfo.io/json');
            data = await response.json();
          } else {
            // Per produzione, usa ipapi.co
            const response = await fetch('https://ipapi.co/json/');
            data = await response.json();

            // Se l'IP è IPv6, prova a ottenere IPv4
            if (data.ip && data.ip.includes(':')) {
              try {
                const ipv4Response = await fetch('https://ipapi.co/ip/');
                const ipv4 = await ipv4Response.text();
                if (ipv4 && !ipv4.includes(':')) {
                  data.ip = ipv4.trim();
                }
              } catch (ipv4Error) {
              }
            }
          }
        } catch (error) {
          // Fallback API
          const fallbackResponse = await fetch('https://ipinfo.io/json');
          data = await fallbackResponse.json();
        }
        
        // Determina il tipo di dispositivo direttamente qui
        const userAgent = navigator.userAgent;
        let deviceType = 'desktop';
        
        // Rilevamento dispositivo più accurato
        if (/iPad|iPhone|iPod/.test(userAgent)) {
          deviceType = 'ios';
        } else if (/Android/.test(userAgent)) {
          deviceType = 'android';
        } else if (/Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
          deviceType = 'mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
          deviceType = 'tablet';
        } else {
          deviceType = 'desktop';
        }
        
        // Preferisci IPv4 se disponibile, altrimenti usa quello che abbiamo
        let ipAddress = data.ip || 'Unknown';
        
        // Gestione dati per diverse API
        const country = data.country_name || data.country || 'Unknown';
        const city = data.city || 'Unknown';
        const region = data.region || data.regionName || 'Unknown';
        const timezone = data.timezone || data.timezone || 'Unknown';

        // Prepara i dati della visita con fallback per dati mancanti
        const visitInfo = {
          ip: ipAddress,
          country: country,
          city: city,
          region: region,
          timezone: timezone,
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
          
          const response = await fetch(`${API_URL}/api/track-visit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(visitInfo)
          });
          
          
          if (response.ok) {
            const result = await response.json();
          } else {
            const errorText = await response.text();
          }
        } catch (serverError) {
          // Il server potrebbe non essere configurato, non è un errore critico
        }
        
      } catch (error) {
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
