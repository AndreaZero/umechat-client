import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShare, FaHome, FaPlus, FaChevronRight, FaChevronLeft, FaMobile, FaDownload } from 'react-icons/fa';
import logo from '../assets/logo.webp';

const PWATutorialModal = ({ isOpen, onClose, deviceType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const iosSteps = [
    {
      id: 1,
      title: "Apri il menu di condivisione",
      description: "Tocca il pulsante di condivisione nella barra degli strumenti del browser",
      icon: FaShare,
      instruction: "Cerca l'icona di condivisione (quadrato con freccia verso l'alto) nella parte inferiore dello schermo"
    },
    {
      id: 2,
      title: "Seleziona 'Aggiungi alla Home'",
      description: "Scorri verso il basso e tocca 'Aggiungi alla Home'",
      icon: FaHome,
      instruction: "Nella lista delle opzioni, cerca e tocca 'Aggiungi alla Home'"
    },
    {
      id: 3,
      title: "Conferma l'installazione",
      description: "Tocca 'Aggiungi' per installare UME Chat sulla tua home screen",
      icon: FaPlus,
      instruction: "Apparirà una finestra di conferma. Tocca 'Aggiungi' per completare l'installazione"
    }
  ];

  const androidSteps = [
    {
      id: 1,
      title: "Apri il menu del browser",
      description: "Tocca i tre puntini nella barra degli strumenti del browser",
      icon: FaShare,
      instruction: "Cerca l'icona con tre puntini verticali nella parte superiore o inferiore dello schermo"
    },
    {
      id: 2,
      title: "Seleziona 'Installa app'",
      description: "Nel menu, cerca e tocca 'Installa app' o 'Aggiungi alla schermata Home'",
      icon: FaDownload,
      instruction: "Cerca l'opzione 'Installa app', 'Aggiungi alla schermata Home' o simile"
    },
    {
      id: 3,
      title: "Conferma l'installazione",
      description: "Tocca 'Installa' per aggiungere UME Chat alla tua home screen",
      icon: FaPlus,
      instruction: "Apparirà una finestra di conferma. Tocca 'Installa' per completare l'installazione"
    }
  ];

  const steps = deviceType === 'ios' ? iosSteps : androidSteps;

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToStep = (index) => {
    setCurrentStep(index);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('ume-pwa-tutorial-shown', 'true');
    }
    onClose();
  };

  const currentStepData = steps[currentStep];

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
          className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700"
        >
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="UME" className="w-8 h-8 rounded-lg object-contain" />
              <div>
                <h2 className="text-lg lg:text-2xl font-bold text-white">Installa UME Chat</h2>
                <p className="text-gray-400 text-sm">Aggiungi l'app alla tua home screen</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Device Info */}
            <div className="p-4 lg:p-6 bg-gray-800/30 border-b border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <FaMobile className="text-purple-400 text-xl" />
                <h3 className="text-lg font-semibold text-white">
                  {deviceType === 'ios' ? 'iPhone/iPad' : 'Android'}
                </h3>
              </div>
              <p className="text-gray-300 text-sm">
                Segui questi semplici passaggi per installare UME Chat come app nativa sul tuo dispositivo.
                Avrai accesso rapido e un'esperienza ottimizzata.
              </p>
            </div>

            {/* Step Content */}
            <div className="flex-1 p-4 lg:p-6 flex flex-col">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-center"
              >
                {/* Step Number */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{currentStep + 1}</span>
                  </div>
                </div>

                {/* Step Info */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <currentStepData.icon className="text-purple-400 text-2xl" />
                    <h3 className="text-xl font-semibold text-white">{currentStepData.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{currentStepData.description}</p>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{currentStepData.instruction}</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="mt-6">
                {/* Dots */}
                <div className="flex justify-center space-x-2 mb-4">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    <FaChevronLeft className="text-sm" />
                    <span className="text-sm">Precedente</span>
                  </button>
                  
                  {currentStep === steps.length - 1 ? (
                    <button
                      onClick={handleClose}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <span className="text-sm">Fatto!</span>
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <span className="text-sm">Successivo</span>
                      <FaChevronRight className="text-sm" />
                    </button>
                  )}
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
                <span>Non mostrare più questo tutorial</span>
              </label>
              
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
              >
                Salta
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWATutorialModal;
