import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlay, FaUsers, FaKey, FaComments, FaTimes, FaEyeSlash } from 'react-icons/fa';

import logo from '../assets/logo.webp';
import { API_URL } from '../config/api';

// Video URLs from server
const video1 = `${API_URL}/videos/1.webm`;
const video2 = `${API_URL}/videos/2.webm`;
const video3 = `${API_URL}/videos/3.webm`;

const WelcomeModal = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const slides = [
    {
      id: 1,
      title: "Crea una Stanza",
      description: "Genera un codice unico per la tua chat",
      icon: FaUsers,
      video: video1,
      content: "Clicca su 'Crea Stanza' per generare un codice unico che potrai condividere con chi vuoi"
    },
    {
      id: 2,
      title: "Entra in una Stanza",
      description: "Usa il codice per unirti a una chat esistente",
      icon: FaKey,
      video: video3,
      content: "Inserisci il codice della stanza per unirti alla conversazione"
    },
    {
      id: 3,
      title: "Chatta in Sicurezza",
      description: "I messaggi svaniscono automaticamente",
      icon: FaComments,
      video: video2,
      content: "Tutti i messaggi vengono cancellati quando esci dalla stanza o dopo 15 minuti di inattività"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('ume-welcome-shown', 'true');
    }
    onClose();
  };

  // Autoplay effect
  useEffect(() => {
    let interval;
    if (isPlaying && isOpen) {
      interval = setInterval(nextSlide, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen]);

  const currentSlideData = slides[currentSlide];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="UME" className="w-8 h-8 rounded-lg object-contain" />
              <div>
                <h2 className="text-lg lg:text-2xl font-bold text-white">Come funziona UME Chat</h2>
                <p className="text-gray-400 text-sm">Benvenuto!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleAutoplay}
                className={`p-2 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <FaPlay className={`text-sm ${isPlaying ? 'animate-pulse' : ''}`} />
              </button>
              <button
                onClick={handleClose}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Video Section */}
            <div className="flex-1 p-4 lg:p-6 flex items-center justify-center bg-gray-800/30">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg"
              >
                <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  {!videoError ? (
                    <video
                      src={currentSlideData.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onError={() => setVideoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <div className="text-center text-gray-400">
                        <FaPlay className="text-4xl mb-2 mx-auto" />
                        <p className="text-sm">Video non disponibile</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                </div>
                
                {/* Slide Number Badge */}
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {currentSlide + 1}/{slides.length}
                </div>
              </motion.div>
            </div>

            {/* Info Section */}
            <div className="w-full lg:w-80 p-4 lg:p-6 bg-gray-800/50 flex flex-col justify-between">
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <currentSlideData.icon className="text-purple-400 text-xl" />
                      <h3 className="text-lg font-semibold text-white">{currentSlideData.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{currentSlideData.description}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{currentSlideData.content}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="mt-6">
                {/* Dots */}
                <div className="flex justify-center space-x-2 mb-4">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={prevSlide}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    <FaChevronLeft className="text-sm" />
                    <span className="text-sm">Precedente</span>
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <span className="text-sm">Successivo</span>
                    <FaChevronRight className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 lg:p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span>Non mostrare più all'avvio</span>
              </label>
              
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Capito!
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
