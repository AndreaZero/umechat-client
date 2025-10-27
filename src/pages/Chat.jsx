import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaTimes, FaUsers, FaCrown, FaBell, FaSmile } from 'react-icons/fa';
import { io } from 'socket.io-client';
import Avatar from '../components/Avatar';
import ConfirmationModal from '../components/ConfirmationModal';
import EmojiPicker from '../components/EmojiPicker';
import LinkifyText from '../components/LinkifyText';
import RoomClosedModal from '../components/RoomClosedModal';
import CountdownTimer from '../components/CountdownTimer';
import { API_URL } from '../config/api';
import useServerStatus from '../hooks/useServerStatus';
import useInactivityCountdown from '../hooks/useInactivityCountdown';
import useRoomStatus from '../hooks/useRoomStatus';
import backgroundImage from '../assets/bg.webp';

const Chat = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isServerDown } = useServerStatus();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRoomClosedModal, setShowRoomClosedModal] = useState(false);
  const [roomClosedReason, setRoomClosedReason] = useState(null);
  const { showCountdown, timeLeft, updateActivity } = useInactivityCountdown(socket, isConnected);
  const { roomExists, isChecking, checkRoomStatus } = useRoomStatus(roomCode, socket);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Ottieni username e isHost dal state della navigazione
    const { username, isHost: userIsHost } = location.state || {};
    
    if (!username) {
      console.error('No username provided, redirecting to home');
      navigate('/');
      return;
    }

    // Imposta username e isHost
    setUsername(username);
    setIsHost(userIsHost || false);

    // Se la stanza non esiste, mostra il modal di chiusura
    if (!roomExists && !isChecking) {
      console.log('Room does not exist, showing closed modal');
      setRoomClosedReason('room-not-found');
      setShowRoomClosedModal(true);
    }

    // Connessione Socket.IO
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      // Entra nella stanza quando la connessione è stabilita
      newSocket.emit('join-room', { 
        roomCode: roomCode.toUpperCase(), 
        username: username
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room-joined', (data) => {
      console.log('Room joined:', data);
      setUsers(data.users);
    });

    newSocket.on('room-history', (data) => {
      console.log('Room history received:', data.messages.length, 'messages');
      setMessages(data.messages);
    });

    newSocket.on('new-message', (message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data);
      setUsers(data.users);
    });

    newSocket.on('user-left', (data) => {
      console.log('User left:', data);
      setUsers(data.users);
    });

    newSocket.on('room-closed', (data) => {
      console.log('Room closed:', data);
      setRoomClosedReason(data?.reason || 'unknown');
      setShowRoomClosedModal(true);
      
      // Disconnetti il socket
      newSocket.disconnect();
    });

    newSocket.on('error', (error) => {
      console.error('Chat error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, roomCode, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Heartbeat per mantenere l'attività
  useEffect(() => {
    if (!socket || !isConnected) return;

    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat');
    }, 30000); // Ogni 30 secondi

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [socket, isConnected]);

  // Monitora se la stanza esiste ancora
  useEffect(() => {
    if (!roomExists && !isChecking && roomCode) {
      console.log('Room does not exist, showing closed modal');
      setRoomClosedReason('room-not-found');
      setShowRoomClosedModal(true);
    }
  }, [roomExists, isChecking, roomCode]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Funzione per raggruppare i messaggi consecutivi dello stesso utente
  const groupMessages = (messages) => {
    if (!messages.length) return [];
    
    const grouped = [];
    let currentGroup = null;
    
    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      
      // Se è il primo messaggio o l'utente è diverso dal precedente
      if (!prevMessage || 
          message.username !== prevMessage.username ||
          new Date(message.timestamp) - new Date(prevMessage.timestamp) > 300000) { // 5 minuti
        
        // Salva il gruppo precedente se esiste
        if (currentGroup) {
          grouped.push(currentGroup);
        }
        
        // Crea nuovo gruppo
        currentGroup = {
          id: message.id,
          username: message.username,
          isHost: message.isHost,
          messages: [message],
          timestamp: message.timestamp
        };
      } else {
        // Aggiungi al gruppo esistente
        currentGroup.messages.push(message);
      }
    });
    
    // Aggiungi l'ultimo gruppo
    if (currentGroup) {
      grouped.push(currentGroup);
    }
    
    return grouped;
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus sull'input dopo aver aggiunto l'emoji
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    
    // Aggiorna attività
    socket.emit('heartbeat');
    updateActivity(); // Aggiorna anche il countdown locale
    console.log('Activity updated - countdown reset');
    
    socket.emit('send-message', {
      roomCode: roomCode.toUpperCase(),
      message: newMessage.trim()
    });
    
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (socket && isConnected) {
      // Aggiorna attività quando l'utente digita
      socket.emit('heartbeat');
      updateActivity(); // Aggiorna anche il countdown locale
      console.log('Typing activity detected - countdown reset');
    }
  };

  const closeRoom = () => {
    if (socket && isHost) {
      setShowCloseConfirm(true);
    }
  };

  const confirmCloseRoom = () => {
    if (socket && isHost) {
      socket.emit('close-room', { roomCode: roomCode.toUpperCase() });
      setShowCloseConfirm(false);
      // La navigazione sarà gestita dall'evento 'room-closed'
    }
  };

  const leaveRoom = () => {
    navigate('/');
  };

  const handleRoomClosedModalClose = () => {
    setShowRoomClosedModal(false);
    setRoomClosedReason(null);
  };

  const handleGoHome = () => {
    setShowRoomClosedModal(false);
    setRoomClosedReason(null);
    navigate('/');
  };

  const handleReconnect = () => {
    setShowRoomClosedModal(false);
    setRoomClosedReason(null);
    // Ricarica la pagina per riconnettersi
    window.location.reload();
  };

    return (
      <div className="h-screen flex items-center justify-center p-1 md:p-4 bg-linear-to-b from-gray-900 via-gray-800 to-black">
        <div className="w-full max-w-4xl h-full md:h-[90vh] bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={leaveRoom}
              className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft className="text-white text-sm" />
            </motion.button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white truncate">
                Stanza {roomCode}
              </h1>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{isConnected ? 'Connesso' : 'Disconnesso'}</span>
                <span>•</span>
                <span>{users.length} utenti</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Users List - Visualizzazione dinamica */}
            <div className="flex items-center space-x-0.5">
              {/* Ordina utenti: host sempre per primo */}
              {users
                .sort((a, b) => {
                  if (a.isHost && !b.isHost) return -1;
                  if (!a.isHost && b.isHost) return 1;
                  return 0;
                })
                .slice(0, 3)
                .map((user, index) => (
                  <Avatar
                    key={index}
                    username={user.username}
                    size="xs"
                    isHost={user.isHost}
                    className="border border-gray-600"
                  />
                ))}
              
              {/* Contatore per utenti aggiuntivi */}
              {users.length > 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white border border-white shadow-lg"
                  title={`${users.length - 3} altri utenti`}
                >
                  +{users.length - 3}
                </motion.div>
              )}
            </div>

            {/* Close Room Button (Host only) */}
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeRoom}
                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                title="Chiudi stanza"
              >
                <FaTimes className="text-white text-sm" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
        <div 
          ref={messagesContainerRef}
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: 'rgba(22, 28, 36, 1)' }}
          className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
        <AnimatePresence>
          {groupMessages(messages).map((group, groupIndex) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`flex ${group.username === username ? 'justify-end' : 'justify-start'} mb-1`}
            >
              <div className={`flex items-start space-x-1 max-w-xs lg:max-w-sm ${
                group.username === username ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Container messaggi del gruppo */}
                <div className="flex flex-col space-y-0.5">
                  {group.messages.map((message, messageIndex) => (
                    <div
                      key={message.id}
                      className={`px-3 py-3 rounded-lg shadow-sm ${
                        group.username === username 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      } ${
                        messageIndex === 0 ? 'rounded-t-lg' : ''
                      } ${
                        messageIndex === group.messages.length - 1 ? 'rounded-b-lg' : ''
                      } ${
                        group.messages.length > 1 && messageIndex > 0 ? 'rounded-none' : ''
                      }`}
                    >
                      {/* Header con avatar e nome utente - solo per il primo messaggio */}
                      {messageIndex === 0 && (
                        <div className="flex items-center space-x-6 mb-2">
                          <Avatar
                            username={group.username}
                            size="xs"
                            isHost={group.isHost}
                            className="shrink-0"
                          />
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium opacity-90">
                              {group.username}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Contenuto messaggio */}
                      <p className="text-xs leading-relaxed">
                        <LinkifyText text={message.message} />
                      </p>
                      
                      {/* Timestamp - solo per l'ultimo messaggio del gruppo */}
                      {/* {messageIndex === group.messages.length - 1 && (
                        <p className="text-8px opacity-50 mt-0.5">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      )} */}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

        {/* Message Input */}
        <div className="bg-gray-700/50 backdrop-blur-sm border-t border-gray-700 p-2 md:p-3 relative">
        <div className="flex items-center space-x-2 md:space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-3 py-2 md:py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:border-gray-500 transition-all text-sm md:text-base min-h-[40px] md:min-h-[44px]"
            maxLength={500}
          />
          
          {/* Emoji Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-all duration-200 shrink-0 flex items-center justify-center min-h-[40px] md:min-h-[44px]"
          >
            <FaSmile className="text-gray-400 text-sm md:text-base" />
          </motion.button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 md:p-2.5 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg md:rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center min-h-[40px] md:min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="text-sm md:text-base" />
          </motion.button>
        </div>
        
        <div className="mt-1 md:mt-2 flex items-center justify-between text-xs md:text-sm text-gray-500">
          <span className="hidden md:block">💡 I messaggi svaniscono quando esci dalla stanza</span>
          <span className="md:hidden">💡 Messaggi temporanei</span>
          <span className="text-gray-400">{newMessage.length}/500</span>
        </div>

        {/* Emoji Picker */}
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
        />
        </div>
      </div>

      {/* Confirmation Modal - Overlay di livello superiore */}
      <ConfirmationModal
        isOpen={showCloseConfirm}
        onConfirm={confirmCloseRoom}
        onCancel={() => setShowCloseConfirm(false)}
        title="Chiudi Stanza"
        message="Sei sicuro di voler chiudere la stanza? Tutti gli utenti verranno disconnessi e la chat verrà eliminata."
        confirmText="Chiudi Stanza"
        cancelText="Annulla"
        type="danger"
      />

      {/* Room Closed Modal - Overlay di livello superiore */}
      <RoomClosedModal
        isOpen={showRoomClosedModal}
        reason={roomClosedReason}
        onClose={handleRoomClosedModalClose}
        onGoHome={handleGoHome}
        onReconnect={handleReconnect}
      />

      {/* Countdown Timer - Overlay di livello superiore */}
      <CountdownTimer
        isVisible={showCountdown}
        timeLeft={timeLeft}
        onComplete={() => {
          // Il countdown è completato, la stanza si chiuderà presto
          console.log('Countdown completed - room will close soon');
        }}
      />
    </div>
  );
};

export default Chat;
