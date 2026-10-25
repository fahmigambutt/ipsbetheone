import React from 'react';
import { Play, Info, Sparkles, Image as ImageIcon, Volume2, Shield } from 'lucide-react';
import { SiteSettings } from '../../types';

interface PembukaanSectionProps {
  siteSettings: SiteSettings;
  onExplore: () => void;
  onViewPhotos: () => void;
}

export const PembukaanSection: React.FC<PembukaanSectionProps> = ({
  siteSettings,
  onExplore,
  onViewPhotos
}) => {
  const heroImage = siteSettings.hero_image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920';
  const tagline = siteSettings.tagline || 'ONE CLASS. ONE STORY. ONE FOREVER.';

  return (
    <section
      id="pembukaan"
      className="relative min-h-[95vh] flex flex-col justify-end px-4 sm:px-8 lg:px-16 pt-28 pb-20 max-w-[1600px] mx-auto z-10 overflow-hidden"
    >
      {/* Cinematic Hero Background Image with Netflix-style Vignette Overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src={heroImage}
          alt={siteSettings.class_name || 'IPS BE THE ONE Hero'}
          className="w-full h-full object-cover object-center transform scale-105 animate-pulse duration-[10000ms]"
        />
        {/* Gradients to fade smoothly into #080808 background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080808]/40 to-[#080808]" />
      </div>

      {/* Hero Content Container */}
      <div className="max-w-4xl space-y-5">
        
        {/* Netflix Red Brand Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/20 text-white text-xs font-mono tracking-widest backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
          <span className="font-extrabold text-[#E50914] tracking-wider uppercase">NETFLIX EDITION</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-200 uppercase font-semibold">{siteSettings.school_name || 'MAN 3 BANJAR'}</span>
        </div>

        {/* Main Class Title with cinematic drop-shadow */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none font-sans uppercase drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
            {siteSettings.opening_title || siteSettings.class_name || 'IPS BE THE ONE'}
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#E50914] tracking-widest uppercase font-mono flex items-center gap-3">
            <span className="h-1 w-8 bg-[#E50914] inline-block rounded-full shadow-[0_0_12px_#E50914]" />
            <span>{tagline}</span>
          </h2>
        </div>

        {/* Cinematic Netflix Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-gray-300 pt-1">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            99% Solid
          </span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold border border-white/15">
            {siteSettings.class_year || '2025/2026'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] font-bold border border-[#E50914]/30">
            30 ANGGOTA
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/20 text-gray-300">
            ULTRA HD
          </span>
          <span className="text-gray-400 hidden sm:inline">
            XII IPS • MAN 3 BANJAR
          </span>
        </div>

        {/* Story Description */}
        <p className="text-sm sm:text-base lg:text-lg text-gray-200 font-sans leading-relaxed max-w-2xl font-light backdrop-blur-md bg-black/40 p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {siteSettings.opening_description ||
            'ONE CLASS. ONE STORY. ONE FOREVER. Sebuah ruang digital eksklusif untuk mengabadikan setiap cerita, tawa, perjuangan, dan ikatan abadi keluarga besar XII IPS MAN 3 Banjar.'}
        </p>

        {/* Netflix-style Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-3">
          {/* Primary Play Button (White with black text, like Netflix) */}
          <button
            onClick={onExplore}
            className="px-7 sm:px-9 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black font-sans font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-105 shadow-[0_4px_24px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none"
            id="start-explore-btn"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>JELAJAHI KENANGAN</span>
          </button>

          {/* Secondary Info Button (Translucent dark, like Netflix Info) */}
          <button
            onClick={onViewPhotos}
            className="px-6 sm:px-8 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-white font-sans font-semibold text-sm tracking-wide transition-all duration-300 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center gap-2.5 hover:scale-105 cursor-pointer focus:outline-none"
            id="view-photos-btn"
          >
            <ImageIcon className="w-5 h-5 text-[#E50914]" />
            <span>ALBUM & GALERI</span>
          </button>
        </div>

      </div>
    </section>
  );
};
