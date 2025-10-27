import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCopy, FaCheck, FaUser, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import ErrorNotification from '../components/ErrorNotification';
import Tooltip from '../components/Tooltip';
import { API_URL } from '../config/api';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopyReminder, setShowCopyReminder] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('error');

  // Mostra reminder per copiare il codice dopo 3 secondi dalla creazione
  useEffect(() => {
    if (roomCode && !copied) {
      const timer = setTimeout(() => {
        setShowCopyReminder(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (copied) {
      setShowCopyReminder(false);
    }
  }, [roomCode, copied]);

  const handleCreateRoom = async () => {
    if (!username.trim()) return;
    
    setIsCreating(true);
    setError(null); // Clear previous errors
    
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
      setIsCreating(false);
      newSocket.disconnect();
    }, 10000);
    
    // Aspetta che la connessione sia stabilita
    newSocket.on('connect', () => {
      console.log('Connected to server');
      clearTimeout(connectionTimeout);
      newSocket.emit('create-room', { username: username.trim() });
    });
    
    newSocket.on('room-created', (data) => {
      console.log('Room created:', data);
      setRoomCode(data.roomCode);
      setIsCreating(false);
      // Disconnetti il socket dopo aver creato la stanza
      newSocket.disconnect();
    });
    
    newSocket.on('error', (errorData) => {
      console.error('Error creating room:', errorData);
      setError(errorData.message || 'Errore durante la creazione della stanza');
      setErrorType('error');
      setIsCreating(false);
      clearTimeout(connectionTimeout);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Server non disponibile. Controlla la connessione e riprova.');
      setErrorType('server');
      setIsCreating(false);
      clearTimeout(connectionTimeout);
    });
    
    newSocket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        setError('Connessione interrotta dal server');
        setErrorType('server');
        setIsCreating(false);
      }
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setShowCopyReminder(false); // Nascondi il reminder
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const joinRoom = () => {
    navigate(`/chat/${roomCode}`, { 
      state: { 
        username: username.trim(),
        isHost: true 
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
          <h1 className="text-2xl font-bold text-white">Crea Stanza</h1>
        </div>

        {!roomCode ? (
          /* Create Room Form */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
          >
            <div className="space-y-6">
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
                onClick={handleCreateRoom}
                disabled={!username.trim() || isCreating}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <FaLock className="text-xl" />
                    <span>Crea Stanza Segreta</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Room Created Success */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Stanza Creata!</h2>
              <p className="text-gray-400">Condividi questo codice con chi vuoi invitare</p>
            </motion.div>

            <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Codice Stanza</p>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl font-mono font-bold text-purple-400 tracking-wider">
                  {roomCode}
                </span>
                <Tooltip 
                  content={copied ? "Codice copiato!" : "Copia il codice"}
                  position="top"
                  isVisible={copied}
                  delay={0}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    {copied ? (
                      <FaCheck className="text-green-400" />
                    ) : (
                      <FaCopy className="text-gray-400" />
                    )}
                  </motion.button>
                </Tooltip>
              </div>
              
              {/* Reminder per copiare il codice */}
              {showCopyReminder && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg"
                >
                  <div className="flex items-center space-x-2 text-orange-300">
                    <FaExclamationTriangle className="text-sm" />
                    <span className="text-sm font-medium">
                      Ricorda di copiare il codice per condividerlo!
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={joinRoom}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300"
            >
              Entra nella Chat
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Error Notification */}
      <ErrorNotification 
        error={error} 
        errorType={errorType}
        onClose={() => setError(null)} 
      />
    </div>
  );
};

export default CreateRoom;
