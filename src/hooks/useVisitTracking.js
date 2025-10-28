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
          const response = await fetch('https://ipapi.co/json/');
          data = await response.json();
          console.log('ipapi.co Response:', data);
          
          // Se l'IP è IPv6, prova a ottenere IPv4
          if (data.ip && data.ip.includes(':')) {
            console.log('IPv6 detected, trying to get IPv4...');
            try {
              const ipv4Response = await fetch('https://ipapi.co/ip/');
              const ipv4 = await ipv4Response.text();
              if (ipv4 && !ipv4.includes(':')) {
                data.ip = ipv4.trim();
                console.log('IPv4 obtained:', data.ip);
              }
            } catch (ipv4Error) {
              console.log('Could not get IPv4:', ipv4Error);
            }
          }
        } catch (error) {
          console.log('ipapi.co failed, trying fallback...');
          // Fallback API
          const fallbackResponse = await fetch('https://ipinfo.io/json');
          data = await fallbackResponse.json();
          console.log('Fallback API Response:', data);
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
        
        console.log('User Agent:', userAgent); // Debug
        console.log('Detected Device Type:', deviceType); // Debug
        console.log('Final Visit Info:', visitInfo); // Debug completo

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
          console.log('📤 Sending visit data to server:', visitInfo);
          const response = await fetch(`${API_URL}/api/track-visit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(visitInfo)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Visit tracked successfully:', result);
          } else {
            console.log('❌ Server response not ok:', response.status);
          }
        } catch (serverError) {
          // Il server potrebbe non essere configurato, non è un errore critico
          console.log('❌ Server tracking non disponibile:', serverError.message);
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
