
import React from 'react';
import { Monitor, Smartphone, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DisplayMode } from '../types';

interface ModeSelectionProps {
  onSelect: (mode: DisplayMode) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choisissez votre expérience
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Comment souhaitez-vous utiliser l'application aujourd'hui ?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Computer Mode */}
            <button
              onClick={() => onSelect('computer')}
              className="group relative flex flex-col items-center p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary transition-all duration-300 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ordinateur</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interface complète optimisée pour les grands écrans et la souris.
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>

            {/* Phone Mode */}
            <button
              onClick={() => onSelect('phone')}
              className="group relative flex flex-col items-center p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary transition-all duration-300 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
            >
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mobile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interface épurée et tactile, parfaite pour votre smartphone.
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Vous pourrez changer ce mode à tout moment dans les réglages.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModeSelection;
