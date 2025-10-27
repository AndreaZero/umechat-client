import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSignInAlt, FaUser, FaKey } from 'react-icons/fa';
import { io } from 'socket.io-client';
import ErrorNotification from '../components/ErrorNotification';
import { API_URL } from '../config/api';
import useServerStatus from '../hooks/useServerStatus';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { isServerDown } = useServerStatus();
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('error');
  const [socket, setSocket] = useState(null);

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !username.trim()) return;
    
    setIsJoining(true);
    setError('');
    
    // Connessione Socket.IO
    const newSocket = io(API_URL, {
      timeout: 5000,
      forceNew: true
    });
    setSocket(newSocket);
    
    // Timeout per la connessione
    const connectionTimeout = setTimeout(() => {
      console.error('Connection timeout');
      setError('Impossibile connettersi al server. Verifica che il server sia attivo.');
      setErrorType('server');
      setIsJoining(false);
      newSocket.disconnect();
    }, 10000);
    
    // Aspetta che la connessione sia stabilita
    newSocket.on('connect', () => {
      console.log('Connected to server');
      clearTimeout(connectionTimeout);
      newSocket.emit('join-room', { 
        roomCode: roomCode.trim().toUpperCase(), 
        username: username.trim() 
      });
    });
    
    newSocket.on('room-joined', (data) => {
      console.log('Room joined:', data);
      setIsJoining(false);
      // Disconnetti il socket dopo aver verificato l'entrata
      newSocket.disconnect();
      navigate(`/chat/${roomCode.toUpperCase()}`, { 
        state: { 
          username: username.trim(),
          isHost: false 
        } 
      });
    });
    
    newSocket.on('error', (errorData) => {
      console.error('Error joining room:', errorData);
      setError(errorData.message || 'Errore durante l\'entrata nella stanza');
      setErrorType('error');
      setIsJoining(false);
      clearTimeout(connectionTimeout);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Server non disponibile. Controlla la connessione e riprova.');
      setErrorType('server');
      setIsJoining(false);
      clearTimeout(connectionTimeout);
    });
    
    newSocket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        setError('Connessione interrotta dal server');
        setErrorType('server');
        setIsJoining(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="text-white" />
          </motion.button>
          <h1 className="text-2xl font-bold text-white">Entra in Stanza</h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaKey className="inline mr-2" />
                Codice Stanza
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Inserisci il codice"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-center text-lg tracking-wider"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaUser className="inline mr-2" />
                Il tuo nome
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  // Solo lettere e numeri, max 16 caratteri
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
                  setUsername(value);
                }}
                placeholder="Come ti chiamerai? (solo lettere e numeri)"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                maxLength={16}
              />
            </div>


            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinRoom}
              disabled={!roomCode.trim() || !username.trim() || isJoining}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt className="text-xl" />
                  <span>Entra nella Stanza</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>💡 Il codice è sensibile alle maiuscole</p>
          <p>🔒 I messaggi svaniscono quando esci</p>
        </motion.div>
      </motion.div>

      {/* Error Notification */}
      <ErrorNotification 
        error={error} 
        errorType={errorType}
        onClose={() => setError('')} 
      />
    </div>
  );
};

export default JoinRoom;
