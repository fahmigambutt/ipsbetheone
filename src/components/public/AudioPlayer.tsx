import React, { useEffect, useRef } from 'react';
import { SiteSettings } from '../../types';

interface AudioPlayerProps {
  settings: SiteSettings['audio_settings'];
  isPlaying: boolean;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  settings,
  isPlaying
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = settings.volume || 0.35;
    audioRef.current.loop = settings.loop;

    if (isPlaying && settings.enabled) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Autoplay prevented by browser user interaction policy:', err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, settings]);

  if (!settings.enabled || !settings.audio_url) return null;

  return (
    <audio
      ref={audioRef}
      src={settings.audio_url}
      preload="metadata"
      className="hidden"
    />
  );
};
