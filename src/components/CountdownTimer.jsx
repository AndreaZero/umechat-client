import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';

const CountdownTimer = ({ isVisible, timeLeft, onComplete }) => {
  useEffect(() => {
    if (isVisible && timeLeft === 0) {
      onComplete();
    }
  }, [isVisible, timeLeft, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-xl shadow-2xl border border-orange-400/30 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 bg-black/20">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <FaClock className="text-white text-sm" />
              </motion.div>
              <span className="text-white text-sm font-semibold">
                Stanza in chiusura
              </span>
            </div>
          </div>

          {/* Countdown */}
          <div className="px-4 py-3 bg-linear-to-r from-orange-600/80 to-red-600/80">
            <div className="flex items-center justify-center space-x-3">
              {/* Countdown Number */}
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-xl font-bold">
                    {timeLeft}
                  </span>
                </div>
                
                {/* Pulse Effect */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-white/30 rounded-full"
                />
              </motion.div>

              {/* Text */}
              <div className="text-white text-sm">
                <p className="font-medium">
                  {timeLeft === 1 ? 'secondo' : 'secondi'}
                </p>
                <p className="text-xs opacity-80">
                  prima della chiusura
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-1">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / 10) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
                className="h-1 bg-white rounded-full"
              />
            </div>
          </div>

          {/* Warning Message */}
          <div className="px-4 py-2 bg-black/10">
            <div className="flex items-center space-x-2 text-white text-xs">
              <FaExclamationTriangle className="text-yellow-300" />
              <span>Scrivi un messaggio per mantenere la stanza attiva</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CountdownTimer;
