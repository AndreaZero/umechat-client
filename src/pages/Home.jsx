import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSignInAlt, FaShieldAlt, FaClock, FaEyeSlash, FaBolt, FaQuestionCircle, FaQuestion, FaTimes, FaInfo } from 'react-icons/fa';
import WelcomeModal from '../components/WelcomeModal';
import PWATutorialModal from '../components/PWATutorialModal';
import useDeviceDetection from '../hooks/useDeviceDetection';
import logo from '../assets/logo.webp';

const PercheSiModal = ({ isOpen, onClose }) => {
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
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Perché UME Chat?</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-purple-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Privacy Totale</h3>
                  <p className="text-sm">I tuoi messaggi non vengono mai salvati. Quando esci dalla stanza, tutto svanisce per sempre.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Anonimato Garantito</h3>
                  <p className="text-sm">Nessun account, nessuna registrazione. Usa solo un nome temporaneo e chatta liberamente.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-green-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Semplicità Assoluta</h3>
                  <p className="text-sm">Crea una stanza, condividi il codice, inizia a chattare. Nessuna configurazione complessa.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-yellow-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Controllo Totale</h3>
                  <p className="text-sm">Tu decidi chi può entrare nella tua stanza. Nessun algoritmo, nessun controllo esterno.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-300 text-center">
                <span className="font-semibold text-purple-400">Perche si :)</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPercheSiModal, setShowPercheSiModal] = useState(false);
  const [showPWATutorial, setShowPWATutorial] = useState(false);
  const { isMobile, isIOS, isAndroid, canInstallPWA } = useDeviceDetection();
  
  useEffect(() => {
    // Controlla se l'utente ha già visto la guida
    const hasSeenWelcome = localStorage.getItem('ume-welcome-shown');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  // Gestisce la chiusura del welcome modal e mostra il tutorial PWA se necessario
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    
    // Se è un dispositivo mobile e può installare PWA, mostra il tutorial dopo un breve delay
    if (canInstallPWA) {
      const hasSeenPWATutorial = localStorage.getItem('ume-pwa-tutorial-shown');
      if (!hasSeenPWATutorial) {
        setTimeout(() => {
          setShowPWATutorial(true);
        }, 500); // Piccolo delay per una transizione più fluida
      }
    }
  };
  
  /// il tasto "perche" apre un modal al click sul bottone
  /// e si chiude cliccando fuori dal modal
  const handleShowPercheSiModal = () => {
    setShowPercheSiModal(true);
  };
  const handleClosePercheSiModal = () => {
    setShowPercheSiModal(false);
  };

  const features = [
    { icon: FaShieldAlt, text: "Messaggi che svaniscono", color: "text-red-400" },
    { icon: FaEyeSlash, text: "Completamente anonimo", color: "text-purple-400" },
    { icon: FaBolt, text: "Real-time", color: "text-yellow-400" },
    { icon: FaClock, text: "Auto-chiusura 15min", color: "text-blue-400" }
  ];

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-black rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black  rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-black rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <img src={logo} alt="UME" className="w-1/8 mx-auto rounded-lg object-contain" />
          <p className="text-gray-400 text-base font-light mb-4">
            UME Chat - dev by AndreaZero
          </p>
          
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6 text-sm text-gray-300"
          >
            <div className="text-left space-y-2 text-xs leading-relaxed">
              <p>• Crea o entra in una stanza tramite un codice unico.</p>
              <p>• I messaggi non sono mai salvati e svaniscono quando esci dalla stanza.</p>
              <p>• Chatta con chi hai bisogno, senza nessun controllo.</p>
              <p>• Sicuro, anonimo e completamente gratuito.</p>
              <p>• Le stanze si chiudono automaticamente dopo 15 minuti di inattività.</p>
            </div>
          </motion.div>

              {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create')}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg glow-effect transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaPlus className="text-lg" />
            <span>Crea Stanza</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/join')}
            className="w-full bg-linear-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaSignInAlt className="text-lg" />
            <span>Ho un codice</span>
          </motion.button>
        </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-800/30 rounded-lg p-2"
              >
                <feature.icon className={`text-sm ${feature.color}`} />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

    

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className=" mt-6 flex items-center justify-between"
        >
          
          <p className="text-xs text-gray-600">Sicuro • Anonimo • Gratuito</p>
          <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-xs"
          >
            <FaInfo className="text-xs" />
          </button>

          <button
          title="Perché si :)"
            onClick={() => handleShowPercheSiModal()}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-xs"
          >
            <FaQuestion className="text-xs" />
          </button>
          </div>
        </motion.div>
        </motion.div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleWelcomeModalClose} 
      />
      <PercheSiModal
        isOpen={showPercheSiModal}
        onClose={handleClosePercheSiModal}
      />
      {/* PWA Tutorial Modal */}
      <PWATutorialModal
        isOpen={showPWATutorial}
        onClose={() => setShowPWATutorial(false)}
        deviceType={isIOS ? 'ios' : 'android'}
      />
    </div>
  );
};

export default Home;

