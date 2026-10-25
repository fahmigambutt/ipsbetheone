import React, { useState, useEffect, useCallback } from 'react';
import {
  SiteSettings,
  Teacher,
  ClassMember,
  OrganizationRole,
  Album,
  GalleryItem,
  SectionBackground,
  SceneSettings,
  PerformanceMode,
  NGLMessage
} from './types';

import { Main3DCanvas } from './components/3d/Main3DCanvas';
import { Fallback2D } from './components/public/2DFallback';
import { Navbar } from './components/public/Navbar';
import { PembukaanSection } from './components/public/PembukaanSection';
import { StrukturSection } from './components/public/StrukturSection';
import { AnggotaSection } from './components/public/AnggotaSection';
import { FotoKenanganSection } from './components/public/FotoKenanganSection';
import { NglSection } from './components/public/NglSection';
import { PenutupSection } from './components/public/PenutupSection';
import { AudioPlayer } from './components/public/AudioPlayer';


import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & Admin Route state
  const [currentView, setCurrentView] = useState<'PUBLIC' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD'>('PUBLIC');
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Public data state
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<SectionBackground[]>([]);
  const [sceneSettings, setSceneSettings] = useState<SceneSettings[]>([]);
  const [nglMessages, setNglMessages] = useState<NGLMessage[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  // Interactive UI state
  const [activeSection, setActiveSection] = useState<'pembukaan' | 'struktur' | 'anggota' | 'foto' | 'penutup'>('pembukaan');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedMember, setSelectedMember] = useState<ClassMember | null>(null);

  // Audio & Accessibility & Theme
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(() => {
    return (localStorage.getItem('xii_perf_mode') as PerformanceMode) || 'HIGH';
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('xii_theme_mode') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('xii_theme_mode', nextTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Detect WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGlSupported(!!gl);
    } catch (e) {
      setWebGlSupported(false);
    }

    // Check path for admin route
    const path = window.location.pathname;
    if (path.includes('xii-social-panel/login')) {
      setCurrentView('ADMIN_LOGIN');
    } else if (path.includes('xii-social-panel/dashboard')) {
      checkAdminSession();
    }
  }, []);

  const checkAdminSession = async () => {
    try {
      const token = localStorage.getItem('xii_admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['x-admin-token'] = token;

      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();
      if (data.authenticated) {
        setMustChangePassword(data.must_change_password);
        setCurrentView('ADMIN_DASHBOARD');
      } else {
        setCurrentView('ADMIN_LOGIN');
      }
    } catch (e) {
      setCurrentView('ADMIN_LOGIN');
    }
  };

  // Load public data
  const loadPublicData = useCallback(async () => {
    try {
      const res = await fetch('/api/public/all');
      const data = await res.json();

      if (data.maintenance) {
        setMaintenance(true);
        setMaintenanceMsg(data.maintenance_message || 'Situs sedang dalam pemeliharaan.');
        setSiteSettings(data.site_settings);
      } else {
        setMaintenance(false);
        setSiteSettings(data.site_settings);
        setTeachers(data.teachers || []);
        setMembers(data.members || []);
        setRoles(data.roles || []);
        setAlbums(data.albums || []);
        setGalleryItems(data.gallery_items || []);
        setBackgrounds(data.backgrounds || []);
        setSceneSettings(data.scene_settings || []);
        setNglMessages(data.ngl_messages || []);
      }
    } catch (err) {
      console.error('Failed to load public XII Social data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const currentScroll = window.scrollY;
      const progress = Math.min(Math.max(currentScroll / totalHeight, 0), 1);
      setScrollProgress(progress);

      // Determine active section
      const sections: string[] = [
        'pembukaan',
        'struktur',
        'anggota',
        'foto',
        'pesan-rahasia',
        'penutup'
      ];


      sections.forEach((secId) => {
        const el = document.getElementById(secId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.45) {
            setActiveSection(secId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render Admin Login
  if (currentView === 'ADMIN_LOGIN') {
    return (
      <AdminLoginPage
        onLoginSuccess={(mustChange) => {
          setMustChangePassword(mustChange);
          setCurrentView('ADMIN_DASHBOARD');
          window.history.pushState({}, '', '/xii-social-panel/dashboard');
        }}
        onBackToPublic={() => {
          setCurrentView('PUBLIC');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Render Admin Dashboard
  if (currentView === 'ADMIN_DASHBOARD') {
    return (
      <AdminDashboard
        mustChangePasswordInitial={mustChangePassword}
        onLogout={() => {
          fetch('/api/auth/logout', { method: 'POST' });
          setCurrentView('PUBLIC');
          window.history.pushState({}, '', '/');
          loadPublicData();
        }}
        onRefreshPublicData={loadPublicData}
      />
    );
  }

  // Loading screen
  if (isLoading || !siteSettings) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center space-y-4 font-mono text-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#E50914]/50 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.4)]">
          <Sparkles className="w-6 h-6 text-[#E50914] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E50914]" />
          <span className="tracking-widest">MENYIAPKAN KENANGAN IPS BE THE ONE...</span>
        </div>
      </div>
    );
  }

  // Maintenance screen
  if (maintenance) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center font-sans space-y-4">
        <div className="p-4 rounded-full bg-[#141414] border border-[#E50914] text-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.5)]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black font-mono tracking-widest text-white uppercase">
          PERBAIKAN BERKALA ARSIP
        </h1>
        <p className="text-sm text-gray-300 max-w-md font-light">
          {maintenanceMsg || 'Arsip kenangan IPS BE THE ONE sedang dalam proses pemeliharaan oleh pengurus.'}
        </p>
      </div>
    );
  }

  const activeBg = backgrounds.find((b) => b.section_key === activeSection);

  return (
    <div className={`relative min-h-screen transition-colors duration-500 font-sans overflow-x-hidden ${
      theme === 'light'
        ? 'bg-slate-100 text-slate-900 selection:bg-[#E50914] selection:text-white'
        : 'bg-[#080808] text-white selection:bg-[#E50914] selection:text-white'
    }`}>
      
      {/* 3D Master Canvas or 2D Fallback */}
      {webGlSupported && !reducedMotion ? (
        <Main3DCanvas
          scrollProgress={scrollProgress}
          activeSection={activeSection}
          sceneSettingsList={sceneSettings}
          activeBackground={activeBg}
          performanceMode={performanceMode}
          reducedMotion={reducedMotion}
          theme={theme}
        />
      ) : (
        <Fallback2D activeBackground={activeBg} />
      )}

      {/* Top Navbar */}
      <Navbar
        siteSettings={siteSettings}
        activeSection={activeSection}
        onNavigate={handleNavigateSection}
        audioPlaying={audioPlaying}
        onToggleAudio={() => setAudioPlaying(!audioPlaying)}
        performanceMode={performanceMode}
        onChangePerformanceMode={setPerformanceMode}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAdminLogin={() => {
          setCurrentView('ADMIN_LOGIN');
          window.history.pushState({}, '', '/xii-social-panel/login');
        }}
      />

      {/* Background Audio Player */}
      <AudioPlayer
        settings={siteSettings.audio_settings}
        isPlaying={audioPlaying}
      />

      {/* Main Sections */}
      <main className="relative z-10">
        <PembukaanSection
          siteSettings={siteSettings}
          onExplore={() => handleNavigateSection('struktur')}
          onViewPhotos={() => handleNavigateSection('foto')}
        />

        <StrukturSection
          teachers={teachers}
          members={members}
          roles={roles}
          onSelectMember={setSelectedMember}
        />

        <AnggotaSection
          members={members}
          selectedMember={selectedMember}
          onSelectMember={setSelectedMember}
        />

        <FotoKenanganSection
          albums={albums}
          galleryItems={galleryItems}
        />

        <NglSection
          members={members}
          initialMessages={nglMessages}
        />

        <PenutupSection
          siteSettings={siteSettings}
          onReturnToTop={() => handleNavigateSection('pembukaan')}
        />

      </main>

    </div>
  );
}
