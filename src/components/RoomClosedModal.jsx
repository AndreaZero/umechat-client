import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaClock, FaHome, FaRedo } from 'react-icons/fa';

const RoomClosedModal = ({ isOpen, reason, onClose, onGoHome, onReconnect }) => {
  const [countdown, setCountdown] = useState(5);

  // Countdown per redirect automatico
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onGoHome(); // Redirect automatico alla home
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onGoHome]);

  if (!isOpen) return null;

  const getModalContent = () => {
    switch (reason) {
      case 'inactivity':
        return {
          icon: FaClock,
          title: 'Stanza Chiusa per Inattività',
          message: 'La stanza è stata chiusa automaticamente dopo 15 minuti di inattività.',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30'
        };
      case 'room-not-found':
        return {
          icon: FaExclamationTriangle,
          title: 'Stanza Non Trovata',
          message: 'La stanza a cui stai cercando di accedere non esiste più o è stata chiusa.',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        };
      case 'host-closed':
        return {
          icon: FaExclamationTriangle,
          title: 'Stanza Chiusa dall\'Host',
          message: 'L\'host ha chiuso la stanza. Tutti gli utenti sono stati disconnessi.',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          icon: FaExclamationTriangle,
          title: 'Stanza Chiusa',
          message: 'La stanza è stata chiusa.',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const content = getModalContent();
  const IconComponent = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className={`bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border ${content.borderColor} overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-6 ${content.bgColor}`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full ${content.bgColor} flex items-center justify-center`}>
                <IconComponent className={`text-2xl ${content.color}`} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">
              {content.title}
            </h2>
            <p className="text-gray-300 text-center text-sm leading-relaxed">
              {content.message}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Countdown per redirect automatico */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <FaHome className="text-purple-400 text-xl" />
                </motion.div>
                <div>
                  <p className="text-white text-lg font-semibold">
                    Redirect automatico alla Home
                  </p>
                  <p className="text-gray-400 text-sm">
                    in {countdown} {countdown === 1 ? 'secondo' : 'secondi'}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: `${(countdown / 5) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="h-2 bg-linear-to-r from-purple-600 to-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* Manual Go Home Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <FaHome className="text-lg" />
              <span>Vai alla Home Ora</span>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="text-center text-xs text-gray-500">
              {reason === 'inactivity' ? (
                <>
                  <p>💡 La stanza è stata chiusa per inattività</p>
                  <p>🔄 Verrai reindirizzato automaticamente alla home</p>
                </>
              ) : reason === 'room-not-found' ? (
                <>
                  <p>💡 La stanza non esiste più</p>
                  <p>🔄 Verrai reindirizzato automaticamente alla home</p>
                </>
              ) : (
                <>
                  <p>💡 L'host ha chiuso la stanza</p>
                  <p>🔄 Verrai reindirizzato automaticamente alla home</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomClosedModal;
