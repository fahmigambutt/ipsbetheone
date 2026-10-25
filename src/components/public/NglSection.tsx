import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Heart, MessageSquare, Shuffle, CheckCircle2, Lock, Flame, Smile, HelpCircle, Shield, User, Stars } from 'lucide-react';
import { ClassMember, NGLMessage } from '../../types';

interface NglSectionProps {
  members: ClassMember[];
  initialMessages?: NGLMessage[];
}

const STICKER_TAGS = [
  { id: 'confession', label: '🔥 Confession', bg: 'from-orange-500 to-red-600', border: 'border-orange-500/40' },
  { id: 'secret', label: '💬 Pesan Rahasia', bg: 'from-purple-500 to-indigo-600', border: 'border-purple-500/40' },
  { id: 'appreciation', label: '❤️ Apresiasi', bg: 'from-pink-500 to-rose-600', border: 'border-pink-500/40' },
  { id: 'funny', label: '🤣 Pesan Lucu', bg: 'from-amber-400 to-orange-500', border: 'border-amber-400/40' },
  { id: 'question', label: '❓ Pertanyaan', bg: 'from-blue-500 to-cyan-600', border: 'border-blue-500/40' }
] as const;

const PROMPT_IDEAS = [
  "Siapa anak XII Social yang paling sering bikin ngakak pas jam pelajaran?",
  "Pesan atau kenangan paling gak bisa kamu lupain di kelas XII Social...",
  "Ungkapkan sesuatu yang belum pernah kamu sampein ke wali kelas kita!",
  "Sebutkan 1 barang di kelas yang paling banyak kenangannya buat kamu...",
  "Paling kangen sama momen apa pas classmeeting atau study tour?",
  "Siapa yang paling cocok dapet penghargaan siswa ter-rajin XII Social?",
  "Doa terbaik kamu buat temen-temen alumni XII Social MAN 3 Banjar..."
];

const FLOATING_PARTICLES = [
  { id: 1, left: '5%', top: '15%', size: 'w-2.5 h-2.5', bg: 'bg-rose-500/70', delay: '0s', duration: '5s' },
  { id: 2, left: '88%', top: '22%', size: 'w-3 h-3', bg: 'bg-amber-400/80', delay: '1s', duration: '6s' },
  { id: 3, left: '42%', top: '8%', size: 'w-2 h-2', bg: 'bg-red-500/90', delay: '0.5s', duration: '4s' },
  { id: 4, left: '12%', top: '72%', size: 'w-3 h-3', bg: 'bg-rose-400/60', delay: '2s', duration: '7s' },
  { id: 5, left: '78%', top: '68%', size: 'w-2.5 h-2.5', bg: 'bg-orange-400/80', delay: '1.5s', duration: '5.5s' },
  { id: 6, left: '94%', top: '82%', size: 'w-2 h-2', bg: 'bg-rose-500/80', delay: '0.8s', duration: '4.5s' },
  { id: 7, left: '28%', top: '88%', size: 'w-3.5 h-3.5', bg: 'bg-amber-300/70', delay: '2.5s', duration: '6.5s' },
  { id: 8, left: '62%', top: '38%', size: 'w-2.5 h-2.5', bg: 'bg-red-600/70', delay: '1.2s', duration: '5s' },
  { id: 9, left: '8%', top: '48%', size: 'w-2 h-2', bg: 'bg-rose-300/80', delay: '3s', duration: '6s' },
  { id: 10, left: '82%', top: '10%', size: 'w-2 h-2', bg: 'bg-amber-400/90', delay: '0.2s', duration: '4.8s' },
  { id: 11, left: '22%', top: '32%', size: 'w-3 h-3', bg: 'bg-rose-500/60', delay: '1.8s', duration: '7s' },
  { id: 12, left: '70%', top: '92%', size: 'w-2.5 h-2.5', bg: 'bg-orange-500/80', delay: '2.2s', duration: '5.2s' }
];

export const NglSection: React.FC<NglSectionProps> = ({ members, initialMessages = [] }) => {
  const [messages, setMessages] = useState<NGLMessage[]>(initialMessages);
  const [recipientId, setRecipientId] = useState<string>('CLASS');
  const [messageText, setMessageText] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<'confession' | 'secret' | 'appreciation' | 'funny' | 'question'>('confession');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Sync state whenever initialMessages changes (e.g. after deletion or refresh)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const recipientName = recipientId === 'CLASS'
    ? 'Seluruh XII Social'
    : (members.find(m => m.id === recipientId)?.nickname || 'Anggota XII Social');

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * PROMPT_IDEAS.length);
    setMessageText(PROMPT_IDEAS[randomIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ngl-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: recipientId,
          recipient_name: recipientName,
          message: messageText,
          sticker_tag: selectedTag
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages(prev => [data.data, ...prev]);
        setMessageText('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error submitting NGL message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedIds[id]) return;
    setLikedIds(prev => ({ ...prev, [id]: true }));

    // Optimistic UI update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, likes_count: m.likes_count + 1 } : m));

    try {
      await fetch(`/api/ngl-messages/${id}/like`, { method: 'POST' });
    } catch (e) {
      console.error('Error liking message:', e);
    }
  };

  const getTagBadge = (tag?: string) => {
    const found = STICKER_TAGS.find(t => t.id === tag) || STICKER_TAGS[0];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white bg-gradient-to-r ${found.bg} shadow-sm border ${found.border}`}>
        {found.label}
      </span>
    );
  };

  return (
    <section id="pesan-rahasia" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 font-sans overflow-hidden">
      
      {/* Animated Floating Particles & Sparkles Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {FLOATING_PARTICLES.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.size} ${p.bg} blur-[0.5px] animate-float-particle`}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
        {/* Floating Sparkles & Stars */}
        <Sparkles className="absolute left-[8%] top-[18%] w-5 h-5 text-amber-400/70 animate-sparkle-glow" />
        <Stars className="absolute right-[12%] top-[14%] w-6 h-6 text-rose-400/60 animate-sparkle-glow" style={{ animationDelay: '1.5s' }} />
        <Sparkles className="absolute right-[18%] bottom-[15%] w-5 h-5 text-red-500/70 animate-sparkle-glow" style={{ animationDelay: '0.8s' }} />
        <Stars className="absolute left-[15%] bottom-[22%] w-6 h-6 text-orange-400/60 animate-sparkle-glow" style={{ animationDelay: '2.2s' }} />
      </div>

      {/* Header Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-950/60 via-[#1a0507] to-amber-950/60 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(229,9,20,0.25)]">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-white">NGL.LINK</span>
          <span className="text-gray-500">//</span>
          <span className="text-rose-400">PESAN RAHASIA ANONIM</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase">
          KIRIM PESAN ANONIM
        </h2>
        <p className="text-sm text-gray-300 max-w-xl mx-auto font-mono leading-relaxed">
          Punya pesan rahasia, kenangan terpendam, atau apresiasi jujur untuk kawan-kawan kelas? Kirim secara 100% anonim di sini!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: NGL STYLED INPUT CARD */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#181818] to-black border border-white/15 p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-6">
            
            {/* Top NGL Card Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {/* High-end Glowing NGL Badge */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition duration-500 animate-pulse" />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#111] via-[#1a0507] to-[#E50914] border border-white/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(229,9,20,0.6)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_60%)]" />
                    <div className="flex items-center gap-0.5 z-10">
                      <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
                      <span className="font-black text-xs tracking-tighter text-white bg-clip-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        ngl
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-rose-400">
                      NGL.LINK
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-mono font-bold border border-rose-500/30">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 block">100% rahasia & tanpa identitas</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-rose-500 shadow-inner">
                <Shield className="w-4 h-4 text-[#E50914]" />
              </div>
            </div>

            {/* Recipient Dropdown */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-gray-300 block flex items-center justify-between">
                <span>UNTUK REKAN / TUJUAN:</span>
                <span className="text-[#E50914] font-bold">{recipientName}</span>
              </label>
              <div className="relative">
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white focus:border-[#E50914] outline-none appearance-none backdrop-blur-md cursor-pointer"
                >
                  <option value="CLASS" className="bg-neutral-900 text-white">✨ SELURUH KELAS XII SOCIAL</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
                      👤 {m.full_name} ({m.nickname})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Tag Selection */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-gray-300 block">KATEGORI PESAN:</label>
              <div className="flex flex-wrap gap-2">
                {STICKER_TAGS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTag(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      selectedTag === t.id
                        ? `bg-gradient-to-r ${t.bg} text-white shadow-[0_0_12px_rgba(229,9,20,0.4)] scale-105 border border-white/30`
                        : 'bg-white/5 text-gray-300 hover:text-white border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="relative">
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  maxLength={350}
                  placeholder={`Tulis pesan rahasia kamu untuk ${recipientName}...`}
                  className="w-full bg-black/40 border border-white/15 rounded-2xl p-4 text-white focus:border-[#E50914] outline-none resize-none backdrop-blur-md placeholder:text-gray-500 leading-relaxed"
                />
                <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-gray-400">
                  <button
                    type="button"
                    onClick={handleRandomPrompt}
                    className="flex items-center gap-1 text-[#E50914] hover:underline font-bold"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Dapatkan Ide Pesan!</span>
                  </button>
                  <span>{messageText.length} / 350</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !messageText.trim()}
                className={`w-full py-3.5 rounded-2xl font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  isSubmitting || !messageText.trim()
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                    : 'bg-[#E50914] hover:bg-[#F40612] text-white shadow-[0_0_25px_rgba(229,9,20,0.5)] active:scale-95 border border-red-500/30'
                }`}
              >
                {isSubmitting ? (
                  <span>MENGIRIM PESAN ANONIM...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>KIRIM PESAN ANONIM</span>
                  </>
                )}
              </button>
            </form>

            {/* Success Banner */}
            {showSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Pesan rahasia kamu berhasil dikirim secara anonim!</span>
              </div>
            )}

            <div className="text-[10px] font-mono text-center text-gray-400 pt-2 border-t border-white/10">
              🔒 Identitas kamu sepenuhnya aman & tidak tersimpan di server.
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: LIVE RECENT ANONYMOUS MESSAGES FEED */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-gray-300 px-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E50914]" />
              <span className="font-bold text-white uppercase tracking-wider">PESAN TERKIRIM RECENT ({messages.length})</span>
            </div>
            <span className="text-[11px] text-gray-400">Arsip Pesan Anonim</span>
          </div>

          {messages.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-black/40 border border-white/10 font-mono text-xs text-gray-400 space-y-3 backdrop-blur-xl">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-600 animate-pulse" />
              <p>Belum ada pesan anonim yang dikirim.</p>
              <p className="text-[11px] text-gray-500">Jadilah yang pertama mengirimkan pesan rahasia!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
              {messages.map((m) => {
                const isLiked = likedIds[m.id];
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-xl shadow-lg space-y-3 hover:border-white/30 transition-all group"
                  >
                    {/* Top Meta */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {getTagBadge(m.sticker_tag)}
                        <span className="text-gray-300 text-[11px]">
                          untuk <strong className="text-white">{m.recipient_name || 'Seluruh XII Social'}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Content Message */}
                    <p className="text-sm text-white font-sans font-medium leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10">
                      "{m.message}"
                    </p>

                    {/* Admin/Recipient Reply if exists */}
                    {m.reply && (
                      <div className="pl-4 border-l-2 border-[#E50914] pt-1 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#E50914] font-bold uppercase">
                          <MessageSquare className="w-3 h-3" />
                          <span>Balasan Kelas:</span>
                        </div>
                        <p className="text-xs text-gray-200 font-mono italic">
                          "{m.reply}"
                        </p>
                      </div>
                    )}

                    {/* Bottom Like Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Pengirim Anonim</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleLike(m.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isLiked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500 animate-bounce' : 'text-rose-400'}`} />
                        <span>{m.likes_count}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </section>
  );
};
