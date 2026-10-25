import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Calendar,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Tag,
  Film,
  Play,
  Layers
} from 'lucide-react';
import { Album, GalleryItem } from '../../types';

interface FotoKenanganSectionProps {
  albums: Album[];
  galleryItems: GalleryItem[];
}

export const FotoKenanganSection: React.FC<FotoKenanganSectionProps> = ({
  albums,
  galleryItems
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('ALL');
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const albumCarouselRef = useRef<HTMLDivElement | null>(null);

  // Filter gallery items by album & media type
  const visibleItems = galleryItems.filter((item) => {
    const matchesAlbum = selectedAlbumId === 'ALL' || item.album_id === selectedAlbumId;
    const matchesMedia = mediaFilter === 'ALL' || item.media_type === mediaFilter;
    return matchesAlbum && matchesMedia;
  });

  const activeItem = lightboxIndex !== null ? visibleItems[lightboxIndex] : null;

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + visibleItems.length) % visibleItems.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % visibleItems.length);
  };

  const scrollAlbums = (dir: 'left' | 'right') => {
    if (!albumCarouselRef.current) return;
    albumCarouselRef.current.scrollBy({
      left: dir === 'left' ? -350 : 350,
      behavior: 'smooth'
    });
  };

  return (
    <section id="foto" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto z-10">
      
      {/* Header */}
      <div className="flex flex-col space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 text-[#E50914] text-xs font-mono tracking-widest backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <ImageIcon className="w-3.5 h-3.5 text-[#E50914]" />
          <span>KATALOG ALBUM & MULTIMEDIA</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          FOTO & VIDEO KENANGAN IPS BE THE ONE
        </h2>
        <p className="text-sm text-gray-300 font-light max-w-2xl">
          Potret dan rekaman sinematik perjalanan kami. Setiap frame merekam tawa, canda, dan ikatan persaudaraan sejati XII IPS MAN 3 BANJAR.
        </p>
      </div>

      {/* 1. NETFLIX ALBUM CAROUSEL (Horizontal row of categorized albums) */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#E50914] font-bold tracking-widest uppercase flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#E50914]" />
            <span>KATEGORI ALBUM EKSKLUSIF</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollAlbums('left')}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-colors cursor-pointer"
              aria-label="Geser Album Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollAlbums('right')}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-colors cursor-pointer"
              aria-label="Geser Album Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={albumCarouselRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Photos Quick Card */}
          <div
            onClick={() => setSelectedAlbumId('ALL')}
            className={`flex-shrink-0 w-60 sm:w-72 h-36 rounded-2xl p-4 cursor-pointer relative overflow-hidden group transition-all duration-300 border snap-start flex flex-col justify-end ${
              selectedAlbumId === 'ALL'
                ? 'border-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.5)] bg-gradient-to-br from-[#E50914]/40 to-black/80'
                : 'border-white/15 bg-black/60 hover:border-white/30'
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500"
              style={{ backgroundImage: `url(${albums[0]?.cover_image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'})` }}
            />
            <div className="relative z-10">
              <span className="text-[10px] font-mono text-[#E50914] font-bold tracking-widest uppercase block">
                KOLEKSI LENGKAP
              </span>
              <h3 className="text-base font-bold text-white font-sans">Semua Kenangan</h3>
              <span className="text-[10px] font-mono text-gray-300">
                {galleryItems.length} Foto & Video
              </span>
            </div>
          </div>

          {/* Individual Albums */}
          {albums.map((alb) => {
            const count = galleryItems.filter(g => g.album_id === alb.id).length;
            const isSelected = selectedAlbumId === alb.id;
            return (
              <div
                key={alb.id}
                onClick={() => setSelectedAlbumId(alb.id)}
                className={`flex-shrink-0 w-60 sm:w-72 h-36 rounded-2xl p-4 cursor-pointer relative overflow-hidden group transition-all duration-300 border snap-start flex flex-col justify-end ${
                  isSelected
                    ? 'border-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.5)] bg-gradient-to-br from-[#E50914]/40 to-black/80'
                    : 'border-white/15 bg-black/60 hover:border-white/30'
                }`}
              >
                {alb.cover_image_url && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-35 group-hover:scale-105 group-hover:opacity-45 transition-all duration-500"
                    style={{ backgroundImage: `url(${alb.cover_image_url})` }}
                  />
                )}
                <div className="relative z-10">
                  <span className="text-[10px] font-mono text-[#E50914] font-bold tracking-widest uppercase block">
                    ALBUM RESMI
                  </span>
                  <h3 className="text-base font-bold text-white font-sans truncate">{alb.title}</h3>
                  <span className="text-[10px] font-mono text-gray-300">
                    {count} Item
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media Type Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 font-mono text-xs">
        <button
          onClick={() => setMediaFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl transition-all duration-300 cursor-pointer ${
            mediaFilter === 'ALL'
              ? 'bg-[#E50914] text-white font-bold shadow-md'
              : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          SEMUA MEDIA ({visibleItems.length})
        </button>
        <button
          onClick={() => setMediaFilter('IMAGE')}
          className={`px-3.5 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            mediaFilter === 'IMAGE'
              ? 'bg-[#E50914] text-white font-bold shadow-md'
              : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>FOTO</span>
        </button>
        <button
          onClick={() => setMediaFilter('VIDEO')}
          className={`px-3.5 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            mediaFilter === 'VIDEO'
              ? 'bg-[#E50914] text-white font-bold shadow-md'
              : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>VIDEO KENANGAN</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setLightboxIndex(index)}
            className="group relative bg-[#141414] border border-white/10 hover:border-[#E50914] rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-400 transform hover:scale-105 flex flex-col backdrop-blur-xl"
          >
            {/* Image Box */}
            <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
              <img
                src={item.thumbnail_url || item.file_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />

              {/* Hover Overlay Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                <div className="p-3 rounded-full bg-[#E50914] text-white font-bold shadow-[0_0_20px_rgba(229,9,20,0.7)]">
                  {item.media_type === 'VIDEO' ? <Play className="w-5 h-5 fill-white" /> : <ZoomIn className="w-5 h-5" />}
                </div>
              </div>

              {item.is_featured && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#E50914] text-white font-mono text-[9px] font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(229,9,20,0.7)]">
                  FEATURED
                </div>
              )}

              {item.media_type === 'VIDEO' && (
                <div className="absolute bottom-2.5 right-2.5 p-1 rounded-md bg-black/80 text-white font-mono text-[10px] flex items-center gap-1">
                  <Film className="w-3 h-3 text-[#E50914]" />
                  <span>VIDEO</span>
                </div>
              )}
            </div>

            {/* Photo Info */}
            <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#E50914] transition-colors truncate">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-400 font-light line-clamp-2 pt-0.5">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                {item.photo_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#E50914]" />
                    <span>{item.photo_date}</span>
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                    <MapPin className="w-3 h-3 text-[#E50914]" />
                    <span className="truncate">{item.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleItems.length === 0 && (
        <div className="py-20 text-center space-y-2 font-mono text-gray-400">
          <p>Belum ada foto atau video di album ini.</p>
        </div>
      )}

      {/* FULL-SCREEN CINEMATIC LIGHTBOX */}
      {activeItem && lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-fade-in">
          
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 text-white hover:bg-[#E50914] transition-colors z-20 cursor-pointer"
            aria-label="Tutup Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-all duration-300 z-20 cursor-pointer"
            aria-label="Foto Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-[#E50914] transition-all duration-300 z-20 cursor-pointer"
            aria-label="Foto Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Main Container */}
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center">
            
            {/* Media Content */}
            <div className="relative max-h-[68vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/50 border border-white/15">
              {activeItem.media_type === 'VIDEO' ? (
                <video
                  src={activeItem.file_url}
                  controls
                  autoPlay
                  className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              ) : (
                <img
                  src={activeItem.file_url}
                  alt={activeItem.title}
                  className="max-h-[68vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {/* Metadata Footer */}
            <div className="w-full mt-4 p-5 rounded-2xl bg-[#141414] border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-sans">{activeItem.title}</h3>
                  <span className="text-xs font-mono text-gray-400">
                    ({lightboxIndex + 1} / {visibleItems.length})
                  </span>
                </div>
                {activeItem.description && (
                  <p className="text-xs text-gray-300 font-light max-w-2xl">
                    {activeItem.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-[10px] font-mono text-gray-400 pt-1">
                  {activeItem.photo_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#E50914]" />
                      <span>{activeItem.photo_date}</span>
                    </span>
                  )}
                  {activeItem.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E50914]" />
                      <span>{activeItem.location}</span>
                    </span>
                  )}
                  {activeItem.people_tags && activeItem.people_tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#E50914]" />
                      <span>{activeItem.people_tags.join(', ')}</span>
                    </span>
                  )}
                </div>
              </div>

              {activeItem.allow_download && (
                <a
                  href={activeItem.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#E50914] text-white font-mono text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all duration-300 flex-shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Media</span>
                </a>
              )}
            </div>

          </div>

        </div>
      )}

    </section>
  );
};
