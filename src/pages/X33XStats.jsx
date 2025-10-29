import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaGlobe, FaCalendarDay, FaCalendarWeek, FaTimes, FaChartBar, FaMobile, FaDesktop, FaTabletAlt, FaShieldAlt, FaSignOutAlt, FaComments, FaUsers, FaHome } from 'react-icons/fa';
import { API_URL } from '../config/api';
import AuthModal from '../components/AuthModal';
import logo from '../assets/icon.png';
import { Link } from 'react-router-dom';

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
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="UME" className="w-8 rounded-lg object-contain" />
              <h1 className="text-lg font-bold text-white">UME Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/">
                <button className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
                  <FaHome className="text-xs" />
                  <span>Home</span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <FaSignOutAlt className="text-xs" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-300 text-sm">Caricamento statistiche...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
              <FaTimes className="text-red-400 text-2xl mx-auto mb-3" />
              <p className="text-red-400 mb-3 text-sm">{error}</p>
              <button
                onClick={() => {
                  const password = sessionStorage.getItem('x33x-auth');
                  if (password) fetchStats(password);
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                Riprova
              </button>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Statistiche Principali */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaEye className="text-blue-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Visite Totali</h3>
                </div>
                <p className="text-xl font-bold text-blue-400">{stats.totalVisits}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaGlobe className="text-green-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">IP Unici</h3>
                </div>
                <p className="text-xl font-bold text-green-400">{stats.uniqueIPs}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendarDay className="text-yellow-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Oggi</h3>
                </div>
                <p className="text-xl font-bold text-yellow-400">{stats.visitsToday}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendarWeek className="text-purple-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Settimana</h3>
                </div>
                <p className="text-xl font-bold text-purple-400">{stats.visitsThisWeek}</p>
              </div>
            </div>

            {/* Statistiche Stanze e Messaggi */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaHome className="text-orange-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Stanze Create</h3>
                </div>
                <p className="text-xl font-bold text-orange-400">{stats.totalRoomsCreated || 0}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaUsers className="text-cyan-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Stanze Attive</h3>
                </div>
                <p className="text-xl font-bold text-cyan-400">{stats.activeRooms || 0}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaComments className="text-pink-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Messaggi</h3>
                </div>
                <p className="text-xl font-bold text-pink-400">{stats.totalMessagesSent || 0}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FaUsers className="text-indigo-400 text-sm" />
                  <h3 className="font-medium text-white text-sm">Utenti Online</h3>
                </div>
                <p className="text-xl font-bold text-indigo-400">{stats.totalUsersInRooms || 0}</p>
              </div>
            </div>

            {/* Statistiche Dispositivi */}
            {stats.deviceStats && Object.keys(stats.deviceStats).length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Dispositivi</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(stats.deviceStats).map(([deviceType, count]) => (
                    <div key={deviceType} className="bg-gray-700/30 rounded-lg p-2">
                      <div className="flex items-center space-x-2 mb-1">
                        {getDeviceIcon(deviceType)}
                        <h4 className="font-medium text-white text-xs">{getDeviceLabel(deviceType)}</h4>
                      </div>
                      <p className="text-lg font-bold text-white">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Visite Recenti */}
            {stats.recentVisits && stats.recentVisits.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Visite Recenti</h3>
                <div className="bg-gray-700/30 rounded-lg p-3 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {stats.recentVisits.map((visit, index) => (
                      <div key={visit.id || index} className="flex items-center justify-between text-xs bg-gray-600/30 rounded-lg p-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {getDeviceIcon(visit.deviceType)}
                            <span className="text-gray-300">{getDeviceLabel(visit.deviceType)}</span>
                          </div>
                          <span className="text-gray-300">{visit.city}, {visit.country}</span>
                          <span className="text-gray-500 font-mono text-xs">{visit.ip}</span>
                        </div>
                        <span className="text-gray-500 text-xs">
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
    </div>
  );
};

export default X33XStats;
