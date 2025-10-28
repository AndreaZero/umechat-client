import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MediaPreview = ({ url }) => {
  const [mediaType, setMediaType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const detectMediaType = () => {
      setIsLoading(true);
      setError(false);

      // YouTube detection
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const youtubeMatch = url.match(youtubeRegex);
      
      if (youtubeMatch) {
        setMediaType({
          type: 'youtube',
          videoId: youtubeMatch[1],
          embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
        });
        setIsLoading(false);
        return;
      }

      // Image detection
      const imageRegex = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
      if (imageRegex.test(url)) {
        setMediaType({
          type: 'image',
          url: url
        });
        setIsLoading(false);
        return;
      }

      // Try to load as image to check if it's an image
      const img = new Image();
      img.onload = () => {
        setMediaType({
          type: 'image',
          url: url
        });
        setIsLoading(false);
      };
      img.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
      img.src = url;
    };

    detectMediaType();
  }, [url]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-700/50 rounded-lg my-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        <span className="ml-2 text-sm text-gray-400">Caricamento...</span>
      </div>
    );
  }

  if (error || !mediaType) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="my-2"
    >
      {mediaType.type === 'youtube' && (
        <div className="relative w-80 max-w-lg mx-auto my-2">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={mediaType.embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            />
          </div>

        </div>
      )}

      {mediaType.type === 'image' && (
        <div className="relative w-full max-w-lg mx-auto my-2">
          <img
            src={mediaType.url}
            alt="Immagine condivisa"
            className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain"
            onError={() => setError(true)}
            loading="lazy"
          />
        </div>
      )}
    </motion.div>
  );
};

export default MediaPreview;
