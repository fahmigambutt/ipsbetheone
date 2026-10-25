/**
 * Types & Interfaces for XII SOCIAL MAN 3 BANJAR Memory Archive
 */

export type PerformanceMode = 'AUTO' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SiteSettings {
  site_title: string;
  school_name: string;
  class_name: string;
  class_year: string;
  tagline?: string;
  hero_image_url?: string;
  opening_title: string;
  opening_subtitle: string;
  opening_description: string;
  closing_title: string;
  closing_description: string;
  logo_url: string;
  favicon_url: string;
  theme_settings: {
    bg_primary: string;
    bg_secondary: string;
    card_bg: string;
    text_primary: string;
    text_secondary: string;
    glow_primary: string;
    glow_secondary: string;
    accent_border: string;
    overlay_color: string;
  };
  audio_settings: {
    enabled: boolean;
    audio_url: string;
    title: string;
    volume: number;
    loop: boolean;
    sfx_enabled: boolean;
  };
  seo_settings: {
    meta_title: string;
    meta_description: string;
    keywords: string;
    og_image: string;
  };
  maintenance_settings: {
    enabled: boolean;
    message: string;
  };
  performance_mode: PerformanceMode;
  is_published: boolean;
}

export interface Teacher {
  id: string;
  full_name: string;
  title: string;
  photo_url: string;
  description: string;
  social_url?: string;
  is_visible: boolean;
}

export interface ClassMember {
  id: string;
  full_name: string;
  nickname: string;
  photo_url: string;
  birth_information?: string;
  motto: string;
  memory_message: string;
  hobby?: string;
  dream?: string;
  social_url?: string;
  is_officer: boolean;
  officer_role?: string;
  display_order: number;
  is_visible: boolean;
}

export interface OrganizationRole {
  id: string;
  role_name: string;
  role_group: 'WALI_KELAS' | 'INTI' | 'SEKSI';
  description?: string;
  display_order: number;
  is_visible: boolean;
  assigned_member_ids?: string[];
  assigned_teacher_id?: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  display_order: number;
  is_visible: boolean;
}

export interface GalleryItem {
  id: string;
  album_id: string;
  media_type: 'IMAGE' | 'VIDEO';
  file_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  photo_date?: string;
  location?: string;
  people_tags?: string[];
  alt_text?: string;
  display_order: number;
  is_featured: boolean;
  allow_download: boolean;
  is_visible: boolean;
}

export interface SectionBackground {
  id: string;
  section_key: 'pembukaan' | 'struktur' | 'anggota' | 'foto' | 'penutup';
  file_url: string;
  mobile_file_url?: string;
  mode: 'full' | '3d_plane' | 'blur' | 'parallax' | 'overlay' | 'none';
  position_x: number;
  position_y: number;
  mobile_position_x: number;
  mobile_position_y: number;
  scale: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  overlay_color: string;
  overlay_opacity: number;
  is_visible: boolean;
}

export interface SceneSettings {
  id: string;
  section_key: 'pembukaan' | 'struktur' | 'anggota' | 'foto' | 'penutup';
  preset: 'MEMORY_ORBIT' | 'DIGITAL_STARFIELD' | 'PHOTO_WORMHOLE' | 'CONSTELLATION_STRUCTURE' | 'FLOATING_ARCHIVE' | 'MINIMAL_DARK' | 'CUSTOM';
  is_enabled: boolean;
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  particle_settings: {
    count: number;
    speed: number;
    size: number;
    opacity: number;
    color: string;
  };
  light_settings: {
    emissive_intensity: number;
    bloom_intensity: number;
    orbital_lines_count: number;
    line_thickness: number;
  };
  camera_settings: {
    speed: number;
    parallax_intensity: number;
    logo_rotation_speed: number;
  };
  fog_settings: {
    color: string;
    density: number;
  };
  mobile_fallback: boolean;
}

export interface AdminUser {
  username: string;
  must_change_password?: boolean;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: string;
  created_at: string;
}

export interface NGLMessage {
  id: string;
  recipient_id?: string; // 'CLASS' or member.id
  recipient_name?: string; // 'Seluruh Kelas XII Social' or member nickname
  message: string;
  sticker_tag?: 'confession' | 'secret' | 'appreciation' | 'funny' | 'question';
  reply?: string;
  reply_at?: string;
  likes_count: number;
  is_visible: boolean;
  created_at: string;
}
