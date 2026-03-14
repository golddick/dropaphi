'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        {/* Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-6 sm:mb-8 md:mb-10"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg font-bold text-white text-2xl sm:h-20 sm:w-20 md:h-24 md:w-24 md:text-3xl"
            style={{ backgroundColor: '#DC143C' }}
          >
            D
          </div>
        </motion.div>

        {/* Main Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-center"
        >
          <h1
            className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl"
            style={{ color: '#1A1A1A' }}
          >
            Drop API
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="mt-3 sm:mt-4 md:mt-5 max-w-xs sm:max-w-sm md:max-w-md"
        >
          <p
            className="text-sm sm:text-base md:text-lg"
            style={{ color: '#666666' }}
          >
            Unified Communication Infrastructure for Africa
          </p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 sm:mt-10 md:mt-12 flex gap-2"
        >
          <motion.div
            animate={{ scaleY: [1, 1.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="h-2 w-1 rounded-full"
            style={{ backgroundColor: '#DC143C' }}
          />
          <motion.div
            animate={{ scaleY: [1, 1.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            className="h-2 w-1 rounded-full"
            style={{ backgroundColor: '#DC143C' }}
          />
          <motion.div
            animate={{ scaleY: [1, 1.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            className="h-2 w-1 rounded-full"
            style={{ backgroundColor: '#DC143C' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
