import React, { useState } from 'react';

export const MUNICIPAL_LOGO_URL = '/assets/aistudio/S__11100249_e2fbf4d1.jpg';

interface MunicipalSealProps {
  className?: string;
  size?: number;
}

export const MunicipalSeal: React.FC<MunicipalSealProps> = ({ className = '', size = 48 }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback SVG representation if image file is unavailable
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="ตราเทศบาลตำบลพระซอง อ.นาแก จ.นครพนม"
      >
        <circle cx="50" cy="50" r="47" fill="#EA580C" stroke="#000" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="35" fill="#E0F2FE" stroke="#000" strokeWidth="1.5" />
        <circle cx="50" cy="38" r="9" fill="#FDE047" stroke="#000" strokeWidth="1" />
        <circle cx="50" cy="38" r="4.5" fill="#FFFFFF" stroke="#000" strokeWidth="1" />
        <path d="M42 56 C42 47 58 47 58 56 Z" fill="#FACC15" stroke="#000" strokeWidth="1" />
        <path d="M36 63 C36 57 64 57 64 63 Z" fill="#FACC15" stroke="#000" strokeWidth="1" />
        <rect x="34" y="64" width="32" height="6" rx="2" fill="#7C3AED" stroke="#000" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <img
      src={MUNICIPAL_LOGO_URL}
      alt="ตราเทศบาลตำบลพระซอง อ.นาแก จ.นครพนม"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`rounded-full object-contain shrink-0 shadow-2xs select-none ${className}`}
      onError={() => setHasError(true)}
      loading="eager"
      referrerPolicy="no-referrer"
    />
  );
};
