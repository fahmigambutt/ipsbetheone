import React from 'react';
import { SectionBackground } from '../../types';
import { SmoothBackground } from './SmoothBackground';

interface Fallback2DProps {
  activeBackground?: SectionBackground;
}

export const Fallback2D: React.FC<Fallback2DProps> = ({ activeBackground }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080808]">
      {/* Subtle CSS particle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#E50914_0.8px,transparent_0.8px)] [background-size:32px_32px] opacity-15" />

      <SmoothBackground activeBackground={activeBackground} />
    </div>
  );
};
