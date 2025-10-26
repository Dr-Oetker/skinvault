import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTI4IDI4SDM2VjM2SDI4VjI4WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K",
  onError 
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      onLoad={() => setHasError(false)}
    />
  );
}
