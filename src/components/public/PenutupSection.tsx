import React from 'react';
import { ArrowUp, Sparkles, Heart, Film } from 'lucide-react';
import { SiteSettings } from '../../types';

interface PenutupSectionProps {
  siteSettings: SiteSettings;
  onReturnToTop: () => void;
  onOpenAdminLogin?: () => void;
}

export const PenutupSection: React.FC<PenutupSectionProps> = ({
  siteSettings,
  onReturnToTop,
  onOpenAdminLogin
}) => {
  const tagline = siteSettings.tagline || 'ONE CLASS. ONE STORY. ONE FOREVER.';

  return (
    <section id="penutup" className="relative min-h-screen flex flex-col justify-between py-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto z-10 text-center">
      
      <div className="my-auto py-12 max-w-4xl mx-auto space-y-8">
        
        {/* Netflix Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/15 text-[#E50914] text-xs font-mono tracking-widest backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <Film className="w-3.5 h-3.5 text-[#E50914]" />
          <span>EPILOG KELAS // POST-CREDITS</span>
        </div>

        {/* Closing Title */}
        <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black text-white font-sans tracking-tight uppercase leading-tight drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
          {siteSettings.closing_title || 'CERITA INI TIDAK BENAR-BENAR BERAKHIR'}
        </h2>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-mono text-[#E50914] font-black tracking-widest uppercase">
          {tagline}
        </p>

        {/* Closing Description */}
        <p className="text-base sm:text-lg text-gray-300 font-sans font-light leading-relaxed max-w-2xl mx-auto backdrop-blur-xl bg-[#141414]/80 p-6 sm:p-8 rounded-3xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.7)]">
          {siteSettings.closing_description ||
            'Mungkin setelah ini kita akan melangkah ke jalan dan mimpi masing-masing. Namun, setiap kenangan, tawa, dan kebersamaan yang pernah kita ukir bersama akan tetap abadi dalam IPS BE THE ONE — XII IPS, MAN 3 Banjar.'}
        </p>

        {/* Return to top */}
        <div className="pt-6">
          <button
            onClick={onReturnToTop}
            className="px-8 py-4 rounded-xl bg-white hover:bg-gray-200 text-black font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 transform hover:scale-105 shadow-[0_4px_24px_rgba(255,255,255,0.3)] inline-flex items-center gap-2 cursor-pointer focus:outline-none"
            id="return-to-top-btn"
          >
            <ArrowUp className="w-4 h-4" />
            <span>KEMBALI KE ATAS</span>
          </button>
        </div>

      </div>

      {/* Netflix-style Footer */}
      <footer className="pt-6 pb-6 px-6 sm:px-10 rounded-2xl bg-[#141414]/90 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E50914] text-white font-black text-xs flex items-center justify-center shadow-[0_0_12px_rgba(229,9,20,0.6)] border border-red-500/30">
            ONE
          </div>
          <span className="tracking-wider text-white font-bold">
            {siteSettings.class_name || 'IPS BE THE ONE'} — {siteSettings.school_name || 'MAN 3 BANJAR'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914] inline" />
            <span>untuk Angkatan {siteSettings.class_year || '2025/2026'}</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-[#E50914] font-semibold">{tagline}</span>
        </div>
      </footer>

    </section>
  );
};
