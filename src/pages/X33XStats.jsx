import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaGlobe, FaCalendarDay, FaCalendarWeek, FaTimes, FaChartBar, FaMobile, FaDesktop, FaTabletAlt, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { API_URL } from '../config/api';
import AuthModal from '../components/AuthModal';

const X33XStats = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Controlla se l'utente è già autenticato
    const authToken = sessionStorage.getItem('x33x-auth');
    if (authToken) {
      setIsAuthenticated(true);
      fetchStats(authToken);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const fetchStats = async (password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/visit-stats`, {
        headers: {
          'x-stats-password': password
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Password non corretta');
        }
        throw new Error('Errore nel caricamento delle statistiche');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
      // Se la password è sbagliata, rimuovi l'autenticazione
      if (err.message.includes('Password non corretta')) {
        sessionStorage.removeItem('x33x-auth');
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    const password = sessionStorage.getItem('x33x-auth');
    setIsAuthenticated(true);
    setShowAuthModal(false);
    fetchStats(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('x33x-auth');
    setIsAuthenticated(false);
    setShowAuthModal(true);
    setStats(null);
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'ios':
      case 'android':
      case 'mobile':
        return <FaMobile className="text-blue-400" />;
      case 'desktop':
        return <FaDesktop className="text-green-400" />;
      case 'tablet':
        return <FaTabletAlt className="text-purple-400" />;
      default:
        return <FaMobile className="text-gray-400" />;
    }
  };

  const getDeviceLabel = (deviceType) => {
    switch (deviceType) {
      case 'ios':
        return 'iPhone/iPad';
      case 'android':
        return 'Android';
      case 'mobile':
        return 'Mobile';
      case 'desktop':
        return 'Desktop';
      case 'tablet':
        return 'Tablet';
      default:
        return 'Sconosciuto';
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-purple-400 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-white">X33X - Statistiche Riservate</h1>
                <p className="text-gray-400 text-sm">Dashboard amministrativa UME Chat</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Caricamento statistiche...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
              <FaTimes className="text-red-400 text-3xl mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  const password = sessionStorage.getItem('x33x-auth');
                  if (password) fetchStats(password);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Riprova
              </button>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Statistiche Principali */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <FaEye className="text-blue-400 text-xl" />
                  <h3 className="font-semibold text-white">Visite Totali</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">{stats.totalVisits}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <FaGlobe className="text-green-400 text-xl" />
                  <h3 className="font-semibold text-white">IP Unici</h3>
                </div>
                <p className="text-3xl font-bold text-green-400">{stats.uniqueIPs}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <FaCalendarDay className="text-yellow-400 text-xl" />
                  <h3 className="font-semibold text-white">Oggi</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{stats.visitsToday}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <FaCalendarWeek className="text-purple-400 text-xl" />
                  <h3 className="font-semibold text-white">Questa Settimana</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">{stats.visitsThisWeek}</p>
              </div>
            </div>

            {/* Statistiche Dispositivi */}
            {stats.deviceStats && Object.keys(stats.deviceStats).length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Statistiche per Dispositivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.deviceStats).map(([deviceType, count]) => (
                    <div key={deviceType} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        {getDeviceIcon(deviceType)}
                        <h4 className="font-semibold text-white">{getDeviceLabel(deviceType)}</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Visite Recenti */}
            {stats.recentVisits && stats.recentVisits.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Visite Recenti</h3>
                <div className="bg-gray-700/30 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-3">
                    {stats.recentVisits.map((visit, index) => (
                      <div key={visit.id || index} className="flex items-center justify-between text-sm bg-gray-600/30 rounded-lg p-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getDeviceIcon(visit.deviceType)}
                            <span className="text-gray-300">{getDeviceLabel(visit.deviceType)}</span>
                          </div>
                          <span className="text-gray-300">{visit.city}, {visit.country}</span>
                          <span className="text-gray-500 font-mono text-xs">{visit.ip}</span>
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
            <div className="text-center text-sm text-gray-500">
              Ultimo aggiornamento: {new Date(stats.lastUpdated).toLocaleString('it-IT')}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default X33XStats;
