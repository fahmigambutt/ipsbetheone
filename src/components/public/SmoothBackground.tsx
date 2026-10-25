import React, { useState, useEffect, useRef } from 'react';
import { SectionBackground } from '../../types';

interface SmoothBackgroundProps {
  activeBackground?: SectionBackground;
}

export const SmoothBackground: React.FC<SmoothBackgroundProps> = ({ activeBackground }) => {
  // We maintain two layers to crossfade between backgrounds smoothly
  const [layers, setLayers] = useState<{
    layer1?: SectionBackground;
    layer2?: SectionBackground;
    activeSlot: 1 | 2;
  }>({
    layer1: activeBackground,
    layer2: undefined,
    activeSlot: 1
  });

  const lastBgKeyRef = useRef<string | undefined>(
    activeBackground ? `${activeBackground.id}_${activeBackground.file_url}_${activeBackground.section_key}` : undefined
  );

  useEffect(() => {
    if (!activeBackground || !activeBackground.file_url) return;

    const bgKey = `${activeBackground.id}_${activeBackground.file_url}_${activeBackground.section_key}`;
    if (lastBgKeyRef.current === bgKey) return;
    lastBgKeyRef.current = bgKey;

    // Preload image to avoid blank flash before crossfading
    const img = new Image();
    img.src = activeBackground.file_url;

    const applyNewBackground = () => {
      setLayers((prev) => {
        if (prev.activeSlot === 1) {
          return {
            layer1: prev.layer1,
            layer2: activeBackground,
            activeSlot: 2
          };
        } else {
          return {
            layer1: activeBackground,
            layer2: prev.layer2,
            activeSlot: 1
          };
        }
      });
    };

    if (img.complete) {
      applyNewBackground();
    } else {
      img.onload = applyNewBackground;
      img.onerror = applyNewBackground; // fallback if image fails to load
    }
  }, [activeBackground]);

  const renderLayer = (bg?: SectionBackground, isActive?: boolean) => {
    if (!bg || !bg.file_url || bg.mode === 'none') return null;

    const opacity = isActive ? (bg.overlay_opacity ?? 0.5) : 0;

    return (
      <div
        key={bg.id + '_' + bg.section_key}
        className="absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url(${bg.file_url})`,
          backgroundPosition: `${bg.position_x ?? 50}% ${bg.position_y ?? 50}%`,
          opacity: opacity,
          filter: `blur(${bg.blur || 0}px) brightness(${bg.brightness || 1}) contrast(${bg.contrast || 1})`,
          transform: `scale(${bg.scale || 1})`,
          mixBlendMode: 'luminosity',
          willChange: 'opacity, transform, filter'
        }}
      />
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {renderLayer(layers.layer1, layers.activeSlot === 1)}
      {renderLayer(layers.layer2, layers.activeSlot === 2)}
    </div>
  );
};
