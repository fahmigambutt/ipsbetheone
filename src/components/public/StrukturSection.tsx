import React, { useRef } from 'react';
import { Users, ExternalLink, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Crown } from 'lucide-react';
import { Teacher, ClassMember, OrganizationRole } from '../../types';

interface StrukturSectionProps {
  teachers: Teacher[];
  members: ClassMember[];
  roles: OrganizationRole[];
  onSelectMember: (member: ClassMember) => void;
}

export const StrukturSection: React.FC<StrukturSectionProps> = ({
  teachers,
  members,
  roles,
  onSelectMember
}) => {
  const intiScrollRef = useRef<HTMLDivElement | null>(null);
  const seksiScrollRef = useRef<HTMLDivElement | null>(null);

  const waliKelas: Teacher = teachers[0] || {
    id: 'fallback-teacher',
    full_name: 'Perdini Adma Sari, S.Pd',
    title: 'Wali Kelas XII IPS',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    description: 'Wali kelas penyabar yang selalu membimbing, memberi dukungan, dan mengarahkan IPS BE THE ONE dengan penuh kasih dan dedikasi.',
    social_url: 'https://instagram.com/man3banjar',
    is_visible: true
  };

  const getAssignedMembers = (role: OrganizationRole) => {
    if (!role.assigned_member_ids || role.assigned_member_ids.length === 0) return [];
    return members.filter(m => role.assigned_member_ids?.includes(m.id));
  };

  const intiRoles = roles.filter(r => r.role_group === 'INTI');
  const seksiRoles = roles.filter(r => r.role_group === 'SEKSI');

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = 360;
    ref.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  return (
    <section id="struktur" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="flex flex-col items-start space-y-3 mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 text-[#E50914] text-xs font-mono tracking-widest backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <Users className="w-3.5 h-3.5 text-[#E50914]" />
          <span>STRUKTUR KELAS // HIERARKI KEPEMIMPINAN</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          STRUKTUR ORGANISASI IPS BE THE ONE
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-light">
          Nakhoda dan jajaran pengurus yang senantiasa menjaga kebersamaan, keteraturan, dan solidaritas XII IPS MAN 3 BANJAR.
        </p>
      </div>

      {/* 1. NODE UTAMA: WALI KELAS (Netflix Hero Spotlight) */}
      <div className="mb-16 flex justify-center">
        <div className="w-full max-w-2xl bg-[#141414] border border-white/15 hover:border-[#E50914] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] relative overflow-hidden group transition-all duration-400">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#E50914] text-white font-mono text-[10px] font-bold tracking-widest rounded-bl-xl uppercase shadow-[0_0_15px_rgba(229,9,20,0.6)] flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            <span>PEMBIMBING UTAMA</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#E50914] flex-shrink-0 shadow-[0_0_25px_rgba(229,9,20,0.35)] group-hover:scale-105 transition-transform duration-500">
              <img
                src={waliKelas.photo_url}
                alt={waliKelas.full_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <span className="text-xs font-mono text-[#E50914] font-bold tracking-widest uppercase block">
                {waliKelas.title || 'WALI KELAS XII IPS'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-sans">
                {waliKelas.full_name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                {waliKelas.description}
              </p>
              {waliKelas.social_url && (
                <a
                  href={waliKelas.social_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-300 hover:text-[#E50914] pt-1 transition-colors"
                >
                  <span>Mengenal Pembimbing</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#E50914]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PENGURUS INTI (Ketua, Wakil, Bendahara, Sekretaris) */}
      <div className="mb-14 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-mono text-[#E50914] tracking-widest uppercase flex items-center gap-2 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>PENGURUS INTI KELAS (KETUA, WAKIL, BENDAHARA, SEKRETARIS)</span>
          </h3>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollContainer(intiScrollRef, 'left')}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-colors"
              aria-label="Geser Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(intiScrollRef, 'right')}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-colors"
              aria-label="Geser Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container for Inti */}
        <div
          ref={intiScrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {intiRoles.map((role) => {
            const assigned = getAssignedMembers(role);
            return (
              <div
                key={role.id}
                className="flex-shrink-0 w-72 sm:w-80 bg-[#141414] border border-white/15 hover:border-[#E50914] rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)] snap-start group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-[#E50914] font-bold tracking-wider uppercase block">
                      {role.role_name}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                  </div>
                  <p className="text-xs text-gray-400 font-light mb-4">
                    {role.description || 'Pengurus inti kelas'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  {assigned.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => onSelectMember(member)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-black/50 hover:bg-white/10 border border-white/10 hover:border-[#E50914] text-left transition-all duration-300 group cursor-pointer backdrop-blur-md"
                    >
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="w-11 h-11 rounded-xl object-cover border border-white/20 group-hover:border-[#E50914] transition-colors"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white group-hover:text-[#E50914] truncate block transition-colors">
                          {member.full_name}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          "{member.nickname}"
                        </span>
                      </div>
                    </button>
                  ))}
                  {assigned.length === 0 && (
                    <span className="text-xs text-gray-500 italic block py-2">Belum ada anggota ditetapkan</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. KOORDINATOR SEKSI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-mono text-[#E50914] font-bold tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>KOORDINATOR SEKSI & DIVISI</span>
          </h3>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollContainer(seksiScrollRef, 'left')}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-colors"
              aria-label="Geser Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(seksiScrollRef, 'right')}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-colors"
              aria-label="Geser Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container for Seksi */}
        <div
          ref={seksiScrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {seksiRoles.map((role) => {
            const assigned = getAssignedMembers(role);
            return (
              <div
                key={role.id}
                className="flex-shrink-0 w-72 sm:w-80 bg-[#141414] border border-white/15 hover:border-[#E50914] rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] snap-start flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-[#E50914] font-bold tracking-wider uppercase block mb-1">
                    {role.role_name}
                  </span>
                  <p className="text-xs text-gray-400 font-light mb-4">
                    {role.description || 'Koordinator seksi'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  {assigned.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => onSelectMember(member)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-black/50 hover:bg-white/10 border border-white/10 hover:border-[#E50914] text-left transition-all duration-300 group cursor-pointer backdrop-blur-md"
                    >
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="w-9 h-9 rounded-lg object-cover border border-white/20"
                      />
                      <span className="text-xs text-white group-hover:text-[#E50914] truncate font-medium transition-colors">
                        {member.full_name}
                      </span>
                    </button>
                  ))}
                  {assigned.length === 0 && (
                    <span className="text-xs text-gray-500 italic block py-2">Belum ada anggota ditetapkan</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
