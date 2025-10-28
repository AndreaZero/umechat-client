import { useState, useEffect, useRef } from 'react';

const useInactivityCountdown = (socket, isConnected) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const inactivityCheckRef = useRef(null);
  const serverTimeoutRef = useRef(15 * 60 * 1000); // Default 15 minuti

  // Funzione per aggiornare l'attività
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    setShowCountdown(false);
    setTimeLeft(10);
    
    // Pulisci i timer esistenti
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (inactivityCheckRef.current) {
      clearTimeout(inactivityCheckRef.current);
      inactivityCheckRef.current = null;
    }
  };

  // Funzione per avviare il countdown
  const startCountdown = () => {
    if (showCountdown) return; // Evita countdown multipli
    
    setShowCountdown(true);
    setTimeLeft(10);
    
    // Timer per il countdown che decrementa ogni secondo
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Countdown completato
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setShowCountdown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Controlla l'inattività ogni secondo
  useEffect(() => {
    if (!socket || !isConnected) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const threshold = serverTimeoutRef.current - 10 * 1000; // 10 secondi prima del timeout
      
      console.log(`Checking inactivity: ${timeSinceActivity}ms since last activity (threshold: ${threshold}ms, server timeout: ${serverTimeoutRef.current}ms)`);
      
      // Se siamo vicini al timeout del server, avvia il countdown
      if (timeSinceActivity >= threshold && !showCountdown) {
        console.log(`Starting countdown - ${Math.round(threshold / 1000)} seconds of inactivity detected`);
        startCountdown();
      }
    };

    const interval = setInterval(checkInactivity, 1000);
    return () => {
      clearInterval(interval);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (inactivityCheckRef.current) {
        clearTimeout(inactivityCheckRef.current);
      }
    };
  }, [socket, isConnected, showCountdown]);

  // Aggiorna l'attività quando l'utente scrive o invia messaggi
  useEffect(() => {
    if (socket) {
      const handleActivity = () => updateActivity();
      
      const handleHeartbeatAck = (data) => {
        // Aggiorna l'attività con il timestamp del server
        lastActivityRef.current = data.timestamp;
        // Aggiorna il timeout del server
        serverTimeoutRef.current = data.inactivityTimeout;
        console.log('Heartbeat ACK received, activity updated, server timeout:', data.inactivityTimeout);
      };
      
      // Ascolta eventi di attività
      socket.on('new-message', handleActivity);
      socket.on('user-joined', handleActivity);
      socket.on('user-left', handleActivity);
      socket.on('heartbeat-ack', handleHeartbeatAck);
      
      return () => {
        socket.off('new-message', handleActivity);
        socket.off('user-joined', handleActivity);
        socket.off('user-left', handleActivity);
        socket.off('heartbeat-ack', handleHeartbeatAck);
      };
    }
  }, [socket]);

  return {
    showCountdown,
    timeLeft,
    updateActivity
  };
};

export default useInactivityCountdown;
