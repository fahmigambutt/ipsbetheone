import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Activity, ShieldCheck, LogIn, Sun, Moon } from 'lucide-react';
import { SiteSettings, PerformanceMode } from '../../types';

interface NavbarProps {
  siteSettings: SiteSettings;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  audioPlaying: boolean;
  onToggleAudio: () => void;
  performanceMode: PerformanceMode;
  onChangePerformanceMode: (mode: PerformanceMode) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onOpenAdminLogin: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteSettings,
  activeSection,
  onNavigate,
  audioPlaying,
  onToggleAudio,
  performanceMode,
  onChangePerformanceMode,
  reducedMotion,
  onToggleReducedMotion,
  onOpenAdminLogin,
  theme = 'dark',
  onToggleTheme
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'pembukaan', label: 'BERANDA' },
    { id: 'struktur', label: 'STRUKTUR' },
    { id: 'anggota', label: 'ANGGOTA' },
    { id: 'foto', label: 'FOTO KENANGAN' },
    { id: 'pesan-rahasia', label: 'PESAN RAHASIA' },
    { id: 'penutup', label: 'PENUTUP' }
  ];

  const isLight = theme === 'light';

  const navbarBg = scrolled
    ? isLight
      ? 'bg-white/95 border-b border-black/10 shadow-md backdrop-blur-xl text-slate-900'
      : 'bg-[#080808]/95 border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl text-white'
    : isLight
      ? 'bg-gradient-to-b from-white/90 via-white/40 to-transparent border-b border-transparent backdrop-blur-[2px] text-slate-900'
      : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent border-b border-transparent backdrop-blur-[2px] text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navbarBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left side: Hidden Admin Trigger + Brand */}
        <div className="flex items-center gap-2">
          {/* Discrete Hidden Admin Trigger (24-32px, unobtrusive, no permanent text) */}
          <button
            onClick={onOpenAdminLogin}
            title="Akses Pengelola"
            aria-label="Pengelola"
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-25 hover:opacity-100 hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-[#E50914] focus:outline-none"
            id="hidden-admin-btn"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Brand / Logo - Netflix Red Badge / Custom Logo with Glow */}
          <button
            onClick={() => onNavigate('pembukaan')}
            className="flex items-center gap-3 group focus:outline-none rounded-md p-1"
            id="brand-logo-btn"
          >
            {siteSettings.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt={siteSettings.class_name || 'Logo Kelas'}
                className="w-9 h-9 rounded-xl object-cover shadow-[0_0_20px_rgba(229,9,20,0.6)] border border-red-500/40 transform group-hover:scale-105 transition-all duration-300 bg-black/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#E50914] text-white font-mono font-black text-sm tracking-widest shadow-[0_0_20px_rgba(229,9,20,0.6)] flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 border border-red-400/30">
                ONE
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className={`font-mono text-sm font-black tracking-wider transition-colors flex items-center gap-2 ${
                isLight ? 'text-slate-900 group-hover:text-[#E50914]' : 'text-white group-hover:text-[#E50914]'
              }`}>
                <span>{siteSettings.class_name || 'IPS BE THE ONE'}</span>
              </span>
              <span className={`text-[10px] font-mono tracking-widest ${isLight ? 'text-slate-500' : 'text-gray-300'}`}>
                {siteSettings.school_name || 'MAN 3 BANJAR'}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all duration-300 rounded-lg relative backdrop-blur-md ${
                  isActive
                    ? isLight
                      ? 'text-slate-900 font-bold bg-slate-200/80 border border-slate-300/80 shadow-sm'
                      : 'text-white font-bold bg-white/15 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5 border border-transparent'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#E50914] rounded-full shadow-[0_0_8px_#E50914]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Login Button */}
        <div className="flex items-center gap-2">
          {/* PROMINENT LOGIN BUTTON */}
          <button
            onClick={onOpenAdminLogin}
            className="px-3.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-mono font-bold text-xs tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_25px_rgba(229,9,20,0.7)] flex items-center gap-1.5 active:scale-95 border border-red-500/30 backdrop-blur-md"
            id="login-header-btn"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>MASUK</span>
          </button>

          {/* Theme Toggle (Dark/Light) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={isLight ? 'Ubah ke Dark Mode' : 'Ubah ke Light Mode'}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                isLight 
                  ? 'bg-black/5 border-slate-200 text-amber-600 hover:bg-black/10' 
                  : 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
              }`}
              id="theme-toggle-btn"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400 animate-pulse" />}
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioPlaying ? 'Matikan Musik Latar' : 'Putar Musik Latar'}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
              isLight 
                ? 'bg-black/5 border-slate-200 text-slate-700 hover:bg-black/10' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            id="audio-toggle-btn"
          >
            {audioPlaying ? (
              <Volume2 className="w-4 h-4 text-[#E50914] animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Mode & Performance Controls Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="Pengaturan Mode Performa"
              className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                isLight 
                  ? 'bg-black/5 border-slate-200 text-slate-700 hover:bg-black/10' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              id="settings-menu-btn"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showSettingsMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl backdrop-blur-2xl p-3 z-50 text-xs space-y-3 font-mono ${
                isLight 
                  ? 'bg-white/90 border-slate-200 shadow-slate-300/50 text-slate-900' 
                  : 'bg-black/80 border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.6)] text-white'
              }`}>
                <div className={`text-[11px] font-bold border-b pb-2 flex items-center justify-between ${
                  isLight ? 'border-slate-200 text-slate-900' : 'border-white/10 text-white'
                }`}>
                  <span>MODE PERFORMA 3D</span>
                  <Sparkles className="w-3 h-3 text-[#E50914]" />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(['AUTO', 'HIGH', 'MEDIUM', 'LOW'] as PerformanceMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        onChangePerformanceMode(mode);
                        setShowSettingsMenu(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wider transition-all ${
                        performanceMode === mode
                          ? 'bg-[#E50914] text-white font-bold shadow-[0_0_10px_rgba(229,9,20,0.5)]'
                          : isLight
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            : 'bg-white/5 text-gray-300 hover:text-white border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className={`border-t pt-2 flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                  <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>Gerakan Minimal</span>
                  <button
                    onClick={onToggleReducedMotion}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      reducedMotion
                        ? 'bg-[#E50914] text-white'
                        : isLight
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}
                  >
                    {reducedMotion ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Secondary Admin Link */}
                <div className={`border-t pt-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onOpenAdminLogin();
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-1 text-[10px] transition-colors ${
                      isLight ? 'text-slate-600 hover:text-[#E50914]' : 'text-gray-300 hover:text-[#E50914]'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-[#E50914]" />
                    <span>Panel Pengelola Kelas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

