import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* 404 Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <FaSearch className="text-3xl text-white" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Pagina Non Trovata
          </h2>
          <p className="text-gray-400 text-lg">
            La pagina che stai cercando non esiste
          </p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <FaExclamationTriangle className="text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Rotta Inesistente</span>
          </div>
          <p className="text-gray-400 text-sm">
            Verifica l'URL o torna alla home page
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
            onClick={goHome}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaHome className="text-lg" />
            <span>Torna alla Home</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goBack}
            className="w-full bg-linear-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaArrowLeft className="text-lg" />
            <span>Torna Indietro</span>
          </motion.button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>💡 Controlla l'URL nella barra degli indirizzi</p>
          <p>🔗 Assicurati di aver digitato correttamente il link</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
