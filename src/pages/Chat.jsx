import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaTimes, FaUsers, FaCrown, FaBell, FaSmile } from 'react-icons/fa';
import { io } from 'socket.io-client';
import Avatar from '../components/Avatar';
import ConfirmationModal from '../components/ConfirmationModal';
import EmojiPicker from '../components/EmojiPicker';
import LinkifyText from '../components/LinkifyText';

const Chat = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

    // Connessione Socket.IO
    const newSocket = io('http://localhost:3001');
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
      if (data && data.reason === 'inactivity') {
        alert('La stanza è stata chiusa per inattività (15 minuti)');
      } else if (isHost) {
        // Se è l'host che ha chiuso la stanza, mostra messaggio di conferma
        console.log('Room closed by host');
      }
      navigate('/');
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

    return (
      <div className="h-screen flex items-center justify-center p-1 md:p-4 bg-linear-to-b from-gray-900 via-gray-800 to-black">
        <div className="w-full max-w-4xl h-full md:h-[90vh] bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-2 md:p-4 mobile-padding">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={leaveRoom}
              className="p-1.5 md:p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors mobile-button"
            >
              <FaArrowLeft className="text-white text-lg" />
            </motion.button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl font-bold text-white truncate">
                Stanza {roomCode}
              </h1>
              <div className="flex items-center space-x-1 md:space-x-2 text-xs text-gray-400">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{isConnected ? 'Connesso' : 'Disconnesso'}</span>
                <span>•</span>
                <span>{users.length} utenti</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Users List - Visualizzazione dinamica */}
            <div className="flex items-center space-x-0.5 md:space-x-1">
              {/* Ordina utenti: host sempre per primo */}
              {users
                .sort((a, b) => {
                  if (a.isHost && !b.isHost) return -1;
                  if (!a.isHost && b.isHost) return 1;
                  return 0;
                })
                .slice(0, 4)
                .map((user, index) => (
                  <Avatar
                    key={index}
                    username={user.username}
                    size="sm"
                    isHost={user.isHost}
                    className="border border-gray-600 md:border-2"
                  />
                ))}
              
              {/* Contatore per utenti aggiuntivi */}
              {users.length > 4 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-lg"
                  title={`${users.length - 4} altri utenti`}
                >
                  +{users.length - 4}
                </motion.div>
              )}
            </div>

           

            {/* Close Room Button (Host only) */}
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeRoom}
                className="p-1.5 md:p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                title="Chiudi stanza"
              >
                <FaTimes className="text-white text-sm md:text-base" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-1 md:p-2 space-y-2 md:space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
        <AnimatePresence>
          {groupMessages(messages).map((group, groupIndex) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`flex ${group.username === username ? 'justify-end' : 'justify-start'} mb-2 md:mb-3`}
            >
              <div className={`flex items-start space-x-2 md:space-x-3 max-w-xs lg:max-w-md ${
                group.username === username ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar - solo per il primo messaggio del gruppo */}
                <Avatar
                  username={group.username}
                  size="sm"
                  isHost={group.isHost}
                  className="ml-2 shrink-0"
                />
                
                {/* Container messaggi del gruppo */}
                <div className="flex flex-col space-y-1">
                  {group.messages.map((message, messageIndex) => (
                    <div
                      key={message.id}
                      className={`px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl shadow-lg ${
                        group.username === username 
                          ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      } ${
                        messageIndex === 0 ? 'rounded-t-xl md:rounded-t-2xl' : ''
                      } ${
                        messageIndex === group.messages.length - 1 ? 'rounded-b-xl md:rounded-b-2xl' : ''
                      } ${
                        group.messages.length > 1 && messageIndex > 0 ? 'rounded-none' : ''
                      }`}
                    >
                      {/* Header con nome utente - solo per il primo messaggio */}
                      {messageIndex === 0 && (
                        <div className="flex items-center space-x-1 md:space-x-2 mb-1">
                          {group.isHost && <FaCrown className="text-yellow-400 text-xs" />}
                          <span className="text-xs font-semibold opacity-90">
                            {group.username}
                          </span>
                        </div>
                      )}
                      
                      {/* Contenuto messaggio */}
                      <p className="text-sm leading-relaxed">
                        <LinkifyText text={message.message} />
                      </p>
                      
                      {/* Timestamp - solo per l'ultimo messaggio del gruppo */}
                      {messageIndex === group.messages.length - 1 && (
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      )}
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
        <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 p-2 md:p-4 mobile-padding relative">
        <div className="flex items-end space-x-2 md:space-x-3">
          {/* Emoji Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 md:p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors shrink-0"
          >
            <FaSmile className="text-gray-400 text-sm" />
          </motion.button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-2 py-2 md:px-4 md:py-3 bg-gray-900/50 border border-gray-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all mobile-input mobile-text text-sm md:text-base"
            maxLength={500}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 md:p-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg md:rounded-xl transition-all duration-300 mobile-button shrink-0"
          >
            <FaPaperPlane className="text-sm md:text-base" />
          </motion.button>
        </div>
        
        <div className="mt-1 md:mt-2 text-xs text-gray-500 text-center mobile-text">
          💡 I messaggi svaniscono quando esci dalla stanza
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
    </div>
  );
};

export default Chat;
