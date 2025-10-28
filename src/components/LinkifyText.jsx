import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import MediaPreview from './MediaPreview';

const LinkifyText = ({ text }) => {
  // Regex per identificare URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Funzione per aprire link in nuova tab
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Funzione per ottenere il dominio dal URL
  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Funzione per determinare il tipo di link
  const getLinkType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('github.com')) return 'github';
    if (url.includes('discord.com') || url.includes('discord.gg')) return 'discord';
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) return 'image';
    return 'generic';
  };

  // Funzione per verificare se un URL è un media
  const isMediaUrl = (url) => {
    const linkType = getLinkType(url);
    return linkType === 'youtube' || linkType === 'image';
  };

  // Funzione per ottenere l'icona del link
  const getLinkIcon = (url) => {
    const type = getLinkType(url);
    switch (type) {
      case 'youtube':
        return '🎥';
      case 'twitter':
        return '🐦';
      case 'instagram':
        return '📷';
      case 'github':
        return '💻';
      case 'discord':
        return '💬';
      case 'reddit':
        return '🔴';
      case 'tiktok':
        return '🎵';
      case 'spotify':
        return '🎵';
      case 'image':
        return '🖼️';
      default:
        return '🔗';
    }
  };

  // Dividi il testo in parti (testo normale e link)
  const parts = text.split(urlRegex);
  
  // Separare media e testo
  const mediaParts = [];
  const textParts = [];
  
  parts.forEach((part, index) => {
    if (urlRegex.test(part) && isMediaUrl(part)) {
      mediaParts.push({ part, index });
    } else {
      textParts.push({ part, index });
    }
  });

  return (
    <>
      {/* Renderizza prima tutti i media */}
      {mediaParts.map(({ part, index }) => (
        <div key={`media-${index}`} className="block w-full">
          <MediaPreview url={part} />
        </div>
      ))}
      
      {/* Poi renderizza il testo e i link normali */}
      {textParts.map(({ part, index }) => {
        if (urlRegex.test(part)) {
          const domain = getDomain(part);
          const icon = getLinkIcon(part);
          
          return (
            <button
              key={index}
              onClick={() => handleLinkClick(part)}
              className="inline-flex items-center space-x-1 px-2 py-1 mx-1 rounded-md border transition-all duration-200 cursor-pointer group bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border-blue-500/30 hover:border-blue-400/50"
              title={`Apri ${part}`}
            >
              <span className="text-sm">{icon}</span>
              <span className="text-sm font-medium truncate max-w-32">
                {domain}
              </span>
              <FaExternalLinkAlt className="text-xs opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        }
        return part;
      })}
    </>
  );
};

export default LinkifyText;
