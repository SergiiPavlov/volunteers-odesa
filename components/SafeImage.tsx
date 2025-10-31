'use client';
import React, {useState} from 'react';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
};

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = '/images/fallbacks/photo-fallback.svg',
}: Props){
  const [cur, setCur] = useState(src);
  return (
    <img
      src={cur}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setCur(fallback)}
    />
  );
}
