import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaGlobe, FaMapMarkerAlt, FaClock, FaTimes, FaInfo } from 'react-icons/fa';
import useVisitTracking from '../hooks/useVisitTracking';

const VisitCounter = ({ showDetails = false }) => {
  const { visitData, visitCount, isLoading, error } = useVisitTracking();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 text-xs">
        <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Caricamento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-400 text-xs">
        <FaInfo className="text-xs" />
        <span>Errore connessione</span>
      </div>
    );
  }

  return (
    <>
      {/* Contatore Visite Compatto */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-gray-500 text-xs">
          <FaEye className="text-xs" />
          <span>{visitCount}</span>
        </div>
        
        {showDetails && visitData && (
          <div className="flex items-center space-x-1 text-gray-500 text-xs">
            <FaGlobe className="text-xs" />
            <span>{visitData.country}</span>
          </div>
        )}
        
        <button
          onClick={() => setShowModal(true)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          title="Dettagli visita"
        >
          <FaInfo className="text-xs" />
        </button>
      </div>

      {/* Modal Dettagli */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Dettagli Visita</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaTimes className="text-gray-400" />
                  </button>
                </div>
                
                {visitData ? (
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <FaEye className="text-purple-400 text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Visite Totali</h3>
                        <p className="text-sm">{visitCount} visite</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <FaGlobe className="text-blue-400 text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Posizione</h3>
                        <p className="text-sm">{visitData.city}, {visitData.country}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <FaMapMarkerAlt className="text-green-400 text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Regione</h3>
                        <p className="text-sm">{visitData.region}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <FaClock className="text-yellow-400 text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Fuso Orario</h3>
                        <p className="text-sm">{visitData.timezone}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-400">
                        <strong>IP:</strong> {visitData.ip}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>Ultima visita:</strong> {new Date(visitData.timestamp).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <p>Nessun dato disponibile</p>
                  </div>
                )}
                
                <div className="mt-6 p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 text-center">
                    I dati sono raccolti in modo anonimo e rispettano la privacy
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisitCounter;
