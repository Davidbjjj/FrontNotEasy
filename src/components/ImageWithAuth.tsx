import React, { useEffect, useRef, useState } from 'react';
import api from '../services/apiClient';

const ImageWithAuth: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setImgSrc(src);
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  const handleError = async () => {
    try {
      const resp = await api.get(src, { responseType: 'blob' as const });
      const blob = resp.data;
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setImgSrc(url);
    } catch (err) {
      console.warn('Failed to load image directly and via API fetch:', src, err);
    }
  };

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />;
};

export default ImageWithAuth;
