import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaServer, FaRedo } from 'react-icons/fa';
import { API_URL } from '../config/api';

const ServerDown = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkServerStatus = async () => {
    try {
      setIsRetrying(true);
      const response = await fetch(`${API_URL}/api/videos`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        // Server è tornato online, ricarica la pagina
        window.location.reload();
      }
    } catch (error) {
      console.log('Server still down:', error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    checkServerStatus();
  };

  const goHome = () => {
    window.location.href = '/';
  };

  // Auto-retry ogni 10 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRetrying) {
        checkServerStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isRetrying]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-red-900 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <FaServer className="text-3xl text-white" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Server Non Disponibile
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            Il server UME Chat è temporaneamente offline
          </p>
          <p className="text-gray-400 text-sm">
            Stiamo lavorando per ripristinare il servizio
          </p>
        </motion.div>

        {/* Status Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold">Connessione Persa</span>
          </div>
          <p className="text-gray-400 text-sm">
            Tentativi di riconnessione: {retryCount}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            {isRetrying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Controllando...</span>
              </>
            ) : (
              <>
                <FaRedo className="text-lg" />
                <span>Riprova Connessione</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goHome}
            className="w-full bg-linear-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaHome className="text-lg" />
            <span>Torna alla Home</span>
          </motion.button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>💡 Il servizio si riprenderà automaticamente</p>
          <p>🔄 La pagina si aggiornerà quando il server tornerà online</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServerDown;
