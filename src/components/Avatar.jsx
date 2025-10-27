import React from 'react';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

const Avatar = ({ username, size = 'md', isHost = false, className = '' }) => {
  // Genera avatar URL basato sull'username usando DiceBear API
  const getAvatarUrl = (name) => {
    // Usa il nome per generare un seed consistente
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash).toString();
    
    // Usa diversi stili di avatar per varietà
    const styles = ['avataaars', 'personas', 'micah', 'adventurer', 'big-smile'];
    const styleIndex = Math.abs(hash) % styles.length;
    const style = styles[styleIndex];
    
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs';
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      case '2xl': return 'w-20 h-20 text-2xl';
      default: return 'w-10 h-10 text-base';
    }
  };

  const avatarUrl = getAvatarUrl(username);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: Math.random() * 0.2 
        }}
        whileHover={{ scale: 1.05 }}
        className={`${sizeClasses} rounded-full overflow-hidden shadow-lg ${className} relative`}
      >
        {/* Immagine Avatar */}
        <img
          src={avatarUrl}
          alt={username}
          title={username}
          className="w-full h-full object-cover cursor-default"
          onError={(e) => {
            // Fallback alle iniziali se l'immagine non carica
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Fallback alle iniziali */}
        <div 
          className="w-full h-full bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold"
          style={{ display: 'none' }}
        >
          <span className="drop-shadow-sm">{username.charAt(0).toUpperCase()}</span>
        </div>
        
        {/* Effetto glow per host */}
        {isHost && (
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-yellow-400 to-yellow-600 opacity-30 blur-sm"></div>
        )}
      </motion.div>
      
      {/* Corona per host - FUORI dall'avatar */}
      {isHost && (
        <motion.div
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center shadow-lg border border-white"
        >
          <span title="Creatore della stanza" className="text-xs"><FaCrown className="text-yellow-400" /></span>
        </motion.div>
      )}
    </div>
  );
};

export default Avatar;
