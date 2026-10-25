import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Users,
  Sparkles,
  X,
  Instagram,
  Heart,
  Award,
  Compass,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows
} from 'lucide-react';
import { ClassMember } from '../../types';

interface AnggotaSectionProps {
  members: ClassMember[];
  selectedMember: ClassMember | null;
  onSelectMember: (member: ClassMember | null) => void;
}

export const AnggotaSection: React.FC<AnggotaSectionProps> = ({
  members,
  selectedMember,
  onSelectMember
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OFFICER' | 'MEMBER' | 'HAS_PHOTO'>('ALL');
  const [viewMode, setViewMode] = useState<'CAROUSEL' | 'GRID'>('CAROUSEL');
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.officer_role && member.officer_role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.hobby && member.hobby.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'OFFICER') return member.is_officer;
      if (activeFilter === 'MEMBER') return !member.is_officer;
      if (activeFilter === 'HAS_PHOTO') return !!member.photo_url;

      return true;
    });
  }, [members, searchQuery, activeFilter]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 480;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section id="anggota" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 text-[#E50914] text-xs font-mono tracking-widest backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Users className="w-3.5 h-3.5 text-[#E50914]" />
            <span>KATALOG ANGGOTA // HALL OF FAME</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            IPS BE THE ONE — ANGGOTA KELAS
          </h2>
          <p className="text-sm text-gray-300 font-light max-w-xl">
            Setiap nama menyimpan kisah, tawa, keringat, dan jejak langkah abadi di MAN 3 Banjar. Klik foto untuk melihat profil lengkap.
          </p>
        </div>

        {/* Search & Layout Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, panggilan, hobi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 backdrop-blur-xl border border-white/20 focus:border-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 font-mono focus:outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/15 p-1 rounded-xl backdrop-blur-md self-end sm:self-auto">
            <button
              onClick={() => setViewMode('CAROUSEL')}
              title="Tampilan Horizontal Netflix"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'CAROUSEL' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Rows className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              title="Tampilan Grid Seluruh Anggota"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'GRID' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 font-mono text-xs items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: `SEMUA (${members.length})` },
            { key: 'OFFICER', label: `PENGURUS KELAS` },
            { key: 'MEMBER', label: `ANGGOTA` },
            { key: 'HAS_PHOTO', label: `BERFOTO` }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-300 backdrop-blur-md cursor-pointer ${
                activeFilter === filter.key
                  ? 'bg-[#E50914] text-white font-bold shadow-[0_0_20px_rgba(229,9,20,0.6)] border border-red-400/40'
                  : 'bg-black/50 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Carousel Navigation Arrow Controls (visible when in CAROUSEL mode) */}
        {viewMode === 'CAROUSEL' && filteredMembers.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-xl bg-black/60 border border-white/20 text-white hover:bg-[#E50914] hover:border-red-500 transition-all duration-300 shadow-md cursor-pointer"
              aria-label="Gulir ke Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-xl bg-black/60 border border-white/20 text-white hover:bg-[#E50914] hover:border-red-500 transition-all duration-300 shadow-md cursor-pointer"
              aria-label="Gulir ke Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* CONTENT: Netflix Horizontal Carousel or Grid */}
      {viewMode === 'CAROUSEL' ? (
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="flex-shrink-0 w-44 sm:w-56 bg-[#141414] border border-white/10 hover:border-[#E50914] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-400 transform hover:scale-105 hover:z-20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] snap-start flex flex-col justify-between"
            >
              {/* Card Photo with Netflix gradient */}
              <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />
                
                {member.is_officer && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#E50914] text-white font-mono font-bold text-[9px] uppercase tracking-wider shadow-[0_0_12px_rgba(229,9,20,0.7)]">
                    {member.officer_role || 'PENGURUS'}
                  </div>
                )}
                
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[11px] font-mono text-[#E50914] font-bold tracking-wider block">
                    "{member.nickname}"
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-3 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-white font-sans group-hover:text-[#E50914] transition-colors truncate">
                  {member.full_name}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono italic truncate">
                  {member.motto || 'IPS BE THE ONE'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Full Grid of Members */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="bg-[#141414] border border-white/10 hover:border-[#E50914] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-400 transform hover:scale-105 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between"
            >
              {/* Card Photo */}
              <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />
                
                {member.is_officer && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#E50914] text-white font-mono font-bold text-[9px] uppercase tracking-wider shadow-[0_0_12px_rgba(229,9,20,0.7)]">
                    {member.officer_role || 'PENGURUS'}
                  </div>
                )}
                
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[11px] font-mono text-[#E50914] font-bold tracking-wider block">
                    "{member.nickname}"
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-3 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-white font-sans group-hover:text-[#E50914] transition-colors truncate">
                  {member.full_name}
                </h3>
                {member.officer_role && (
                  <span className="text-[10px] text-gray-400 font-mono block truncate">
                    {member.officer_role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Search State */}
      {filteredMembers.length === 0 && (
        <div className="py-20 text-center space-y-3 font-mono">
          <Sparkles className="w-8 h-8 text-[#E50914] mx-auto animate-bounce" />
          <p className="text-sm text-gray-300">Tidak ada nama anggota yang cocok dengan pencarian Anda.</p>
        </div>
      )}

      {/* CINEMATIC MEMBER DETAIL MODAL (Netflix Inspired Pop-up) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#141414] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.9)] text-white font-sans space-y-6 max-h-[90vh] overflow-y-auto backdrop-blur-2xl">
            
            {/* Close Button */}
            <button
              onClick={() => onSelectMember(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-[#E50914] border border-white/20 transition-all duration-300 backdrop-blur-md cursor-pointer"
              aria-label="Tutup Detail"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header Profile */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={selectedMember.photo_url}
                  alt={selectedMember.full_name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.5)]"
                />
                {selectedMember.is_officer && (
                  <span className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-[#E50914] text-white shadow-md">
                    <Award className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                {selectedMember.is_officer && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E50914] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(229,9,20,0.5)]">
                    <Award className="w-3 h-3" />
                    {selectedMember.officer_role || 'PENGURUS KELAS'}
                  </span>
                )}
                <h3 className="text-2xl font-black font-sans text-white">
                  {selectedMember.full_name}
                </h3>
                <span className="text-xs font-mono text-[#E50914] font-bold block">
                  Panggilan: "{selectedMember.nickname}"
                </span>
                {selectedMember.birth_information && (
                  <span className="text-xs text-gray-400 font-mono block">
                    {selectedMember.birth_information}
                  </span>
                )}
              </div>
            </div>

            {/* Motto Hidup */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-mono text-[#E50914] font-bold tracking-widest uppercase block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                MOTTO HIDUP
              </span>
              <p className="text-sm text-white italic font-light">
                "{selectedMember.motto}"
              </p>
            </div>

            {/* Pesan Kenangan */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-mono text-[#E50914] font-bold tracking-widest uppercase block flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#E50914]" />
                PESAN KENANGAN UNTUK IPS BE THE ONE
              </span>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                {selectedMember.memory_message}
              </p>
            </div>

            {/* Hobby & Dream Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 backdrop-blur-md">
                <span className="text-[10px] font-mono text-gray-400 block">HOBI</span>
                <span className="font-semibold text-white block truncate">
                  {selectedMember.hobby || '-'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 backdrop-blur-md">
                <span className="text-[10px] font-mono text-[#E50914] font-bold block flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  CITA-CITA
                </span>
                <span className="font-semibold text-white block truncate">
                  {selectedMember.dream || '-'}
                </span>
              </div>
            </div>

            {/* Social Link */}
            {selectedMember.social_url && (
              <a
                href={selectedMember.social_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#b81d24] text-white font-mono font-bold text-xs tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(229,9,20,0.5)] border border-red-500/30 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>IKUTI DI INSTAGRAM</span>
              </a>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
