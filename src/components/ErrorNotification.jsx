import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaWifi, FaServer } from 'react-icons/fa';

const ErrorNotification = ({ error, onClose, type = 'error' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Wait for animation
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  const getErrorIcon = () => {
    switch (type) {
      case 'connection':
        return <FaWifi className="text-red-400" />;
      case 'server':
        return <FaServer className="text-red-400" />;
      default:
        return <FaExclamationTriangle className="text-red-400" />;
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case 'connection':
        return 'bg-red-600/90 border-red-500';
      case 'server':
        return 'bg-orange-600/90 border-orange-500';
      default:
        return 'bg-red-600/90 border-red-500';
    }
  };

  if (!error) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${getErrorColor()} backdrop-blur-sm border rounded-xl shadow-lg max-w-md w-full mx-4`}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getErrorIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {type === 'connection' && 'Errore di Connessione'}
                  {type === 'server' && 'Server Non Disponibile'}
                  {type === 'error' && 'Errore'}
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {error}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(), 300);
                }}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaTimes className="text-gray-300 text-sm" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorNotification;
