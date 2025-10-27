import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config/api';

const useRoomStatus = (roomCode, socket) => {
  const [roomExists, setRoomExists] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const checkIntervalRef = useRef(null);

  // Funzione per verificare se la stanza esiste
  const checkRoomStatus = async () => {
    if (!roomCode || isChecking) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(`${API_URL}/debug/rooms`);
      const data = await response.json();
      
      const room = data.rooms.find(r => r.code === roomCode.toUpperCase());
      setRoomExists(!!room);
      
      if (!room) {
        console.log(`Room ${roomCode} no longer exists`);
      }
    } catch (error) {
      console.error('Error checking room status:', error);
      setRoomExists(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Verifica iniziale quando il componente si monta
  useEffect(() => {
    if (roomCode) {
      checkRoomStatus();
    }
  }, [roomCode]);

  // Verifica periodica ogni 30 secondi
  useEffect(() => {
    if (!roomCode) return;

    checkIntervalRef.current = setInterval(() => {
      checkRoomStatus();
    }, 30000); // Ogni 30 secondi

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [roomCode]);

  // Ascolta eventi socket per aggiornamenti in tempo reale
  useEffect(() => {
    if (!socket) return;

    const handleRoomClosed = (data) => {
      console.log('Room closed event received:', data);
      setRoomExists(false);
    };

    const handleUserLeft = (data) => {
      // Se tutti gli utenti sono usciti, la stanza potrebbe essere chiusa
      if (data.users && data.users.length === 0) {
        setTimeout(() => {
          checkRoomStatus();
        }, 2000); // Aspetta 2 secondi prima di verificare
      }
    };

    socket.on('room-closed', handleRoomClosed);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('room-closed', handleRoomClosed);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket]);

  return {
    roomExists,
    isChecking,
    checkRoomStatus
  };
};

export default useRoomStatus;
