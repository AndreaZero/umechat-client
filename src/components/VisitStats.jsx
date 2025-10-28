import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaGlobe, FaCalendarDay, FaCalendarWeek, FaTimes, FaChartBar } from 'react-icons/fa';
import { API_URL } from '../config/api';
const VisitStats = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/visit-stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FaChartBar className="text-purple-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Statistiche Visite</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-300">Caricamento statistiche...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">Errore nel caricamento delle statistiche</p>
                <button
                  onClick={fetchStats}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Riprova
                </button>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Statistiche Principali */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaEye className="text-blue-400 text-lg" />
                      <h3 className="font-semibold text-white">Visite Totali</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{stats.totalVisits}</p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaGlobe className="text-green-400 text-lg" />
                      <h3 className="font-semibold text-white">IP Unici</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.uniqueIPs}</p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaCalendarDay className="text-yellow-400 text-lg" />
                      <h3 className="font-semibold text-white">Oggi</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{stats.visitsToday}</p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaCalendarWeek className="text-purple-400 text-lg" />
                      <h3 className="font-semibold text-white">Questa Settimana</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{stats.visitsThisWeek}</p>
                  </div>
                </div>
                
                {/* Visite Recenti */}
                {stats.recentVisits && stats.recentVisits.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Visite Recenti</h3>
                    <div className="bg-gray-700/30 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {stats.recentVisits.map((visit, index) => (
                          <div key={visit.id || index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span className="text-gray-300">{visit.city}, {visit.country}</span>
                              <span className="text-gray-300">{visit.ip}</span>
                            </div>
                            <span className="text-gray-500">
                              {new Date(visit.timestamp).toLocaleString('it-IT')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="text-center text-xs text-gray-500">
                  Ultimo aggiornamento: {new Date(stats.lastUpdated).toLocaleString('it-IT')}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VisitStats;
