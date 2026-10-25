import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  initialSiteSettings,
  initialTeachers,
  initialMembers,
  initialRoles,
  initialAlbums,
  initialGalleryItems,
  initialSectionBackgrounds,
  initialSceneSettings
} from './defaultData.js';
import {
  SiteSettings,
  Teacher,
  ClassMember,
  OrganizationRole,
  Album,
  GalleryItem,
  SectionBackground,
  SceneSettings,
  ActivityLog,
  NGLMessage
} from '../types.js';

interface AdminAuthStore {
  username: string;
  password_hash: string;
  must_change_password: boolean;
  updated_at: string;
}

interface FullDataStore {
  site_settings: SiteSettings;
  teachers: Teacher[];
  members: ClassMember[];
  roles: OrganizationRole[];
  albums: Album[];
  gallery_items: GalleryItem[];
  backgrounds: SectionBackground[];
  scene_settings: SceneSettings[];
  activity_logs: ActivityLog[];
  ngl_messages?: NGLMessage[];
  admin_auth: AdminAuthStore;
  draft_store?: Partial<FullDataStore>;
  version: number;
}


const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'data_store.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let memoryStore: FullDataStore | null = null;

export function initDatabase(): FullDataStore {
  if (memoryStore) return memoryStore;

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      if (!memoryStore!.ngl_messages) {
        memoryStore!.ngl_messages = [
          {
            id: 'ngl-1',
            recipient_id: 'CLASS',
            recipient_name: 'Seluruh XII Social',
            message: 'Semoga alumni XII Social MAN 3 Banjar lulus 100% dengan nilai terbaik & sukses di PTN maupun impian masing-masing! 🌟',
            sticker_tag: 'appreciation',
            reply: 'Aamiin Ya Rabbal Alamin! Terima kasih doa dan kenangannya kawan-kawan! ❤️',
            reply_at: new Date().toISOString(),
            likes_count: 24,
            is_visible: true,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'ngl-2',
            recipient_id: 'CLASS',
            recipient_name: 'Seluruh XII Social',
            message: 'Siapa nih yang dulu paling sering minjem pulpen di kelas tapi gak pernah dikembaliin? 🤣🤣',
            sticker_tag: 'funny',
            reply: 'Sssttt... rahasia umum kelas tuh! 😜',
            reply_at: new Date().toISOString(),
            likes_count: 18,
            is_visible: true,
            created_at: new Date(Date.now() - 86400000 * 1).toISOString()
          },
          {
            id: 'ngl-3',
            recipient_id: 'CLASS',
            recipient_name: 'Seluruh XII Social',
            message: 'Bakal kangen banget momen bercanda bareng pas jam kosong dan acara kebersamaan kelas kita 🥺❤️',
            sticker_tag: 'confession',
            likes_count: 31,
            is_visible: true,
            created_at: new Date(Date.now() - 3600000 * 5).toISOString()
          }
        ];
        saveDatabase();
      }
      console.log('Database loaded successfully from file.');
      return memoryStore!;
    } catch (e) {
      console.error('Error reading data file, initializing default seed:', e);
    }
  }

  // Initial seed
  const defaultPasswordHash = bcrypt.hashSync('admin', 10);
  memoryStore = {
    site_settings: initialSiteSettings,
    teachers: initialTeachers,
    members: initialMembers,
    roles: initialRoles,
    albums: initialAlbums,
    gallery_items: initialGalleryItems,
    backgrounds: initialSectionBackgrounds,
    scene_settings: initialSceneSettings,
    ngl_messages: [
      {
        id: 'ngl-1',
        recipient_id: 'CLASS',
        recipient_name: 'Seluruh XII Social',
        message: 'Semoga alumni XII Social MAN 3 Banjar lulus 100% dengan nilai terbaik & sukses di PTN maupun impian masing-masing! 🌟',
        sticker_tag: 'appreciation',
        reply: 'Aamiin Ya Rabbal Alamin! Terima kasih doa dan kenangannya kawan-kawan! ❤️',
        reply_at: new Date().toISOString(),
        likes_count: 24,
        is_visible: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'ngl-2',
        recipient_id: 'CLASS',
        recipient_name: 'Seluruh XII Social',
        message: 'Siapa nih yang dulu paling sering minjem pulpen di kelas tapi gak pernah dikembaliin? 🤣🤣',
        sticker_tag: 'funny',
        reply: 'Sssttt... rahasia umum kelas tuh! 😜',
        reply_at: new Date().toISOString(),
        likes_count: 18,
        is_visible: true,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'ngl-3',
        recipient_id: 'CLASS',
        recipient_name: 'Seluruh XII Social',
        message: 'Bakal kangen banget momen bercanda bareng pas jam kosong dan acara kebersamaan kelas kita 🥺❤️',
        sticker_tag: 'confession',
        likes_count: 31,
        is_visible: true,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    activity_logs: [
      {
        id: 'log-1',
        admin_id: 'admin',
        action: 'INIT_SYSTEM',
        entity_type: 'SYSTEM',
        entity_id: '1',
        metadata: 'Database seeded with default XII SOCIAL MAN 3 Banjar data',
        created_at: new Date().toISOString()
      }
    ],
    admin_auth: {
      username: 'admin',
      password_hash: defaultPasswordHash,
      must_change_password: true,
      updated_at: new Date().toISOString()
    },
    version: 1
  };

  saveDatabase();
  return memoryStore;
}

export function saveDatabase(): void {
  if (!memoryStore) return;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

export function addActivityLog(adminId: string, action: string, entityType: string, entityId: string, metadata?: string) {
  const store = initDatabase();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: new Date().toISOString()
  };
  store.activity_logs.unshift(newLog);
  if (store.activity_logs.length > 200) {
    store.activity_logs = store.activity_logs.slice(0, 200);
  }
  saveDatabase();
}

export const db = {
  getStore: () => initDatabase(),

  // Site Settings
  getSiteSettings: () => initDatabase().site_settings,
  updateSiteSettings: (settings: Partial<SiteSettings>, adminId: string = 'admin') => {
    const store = initDatabase();
    store.site_settings = { ...store.site_settings, ...settings };
    saveDatabase();
    addActivityLog(adminId, 'UPDATE_SITE_SETTINGS', 'SITE_SETTINGS', '1');
    return store.site_settings;
  },

  // Teachers
  getTeachers: () => initDatabase().teachers,
  updateTeachers: (teachers: Teacher[], adminId: string = 'admin') => {
    const store = initDatabase();
    store.teachers = teachers;
    saveDatabase();
    addActivityLog(adminId, 'UPDATE_TEACHERS', 'TEACHERS', '1');
    return store.teachers;
  },

  // Members
  getMembers: () => initDatabase().members,
  createMember: (memberData: Omit<ClassMember, 'id'>, adminId: string = 'admin') => {
    const store = initDatabase();
    const newMember: ClassMember = {
      ...memberData,
      id: `m-${Date.now()}`
    };
    store.members.push(newMember);
    saveDatabase();
    addActivityLog(adminId, 'CREATE_MEMBER', 'CLASS_MEMBER', newMember.id, newMember.full_name);
    return newMember;
  },
  updateMember: (id: string, memberData: Partial<ClassMember>, adminId: string = 'admin') => {
    const store = initDatabase();
    const index = store.members.findIndex(m => m.id === id);
    if (index !== -1) {
      store.members[index] = { ...store.members[index], ...memberData };
      saveDatabase();
      addActivityLog(adminId, 'UPDATE_MEMBER', 'CLASS_MEMBER', id, store.members[index].full_name);
      return store.members[index];
    }
    return null;
  },
  deleteMember: (id: string, adminId: string = 'admin') => {
    const store = initDatabase();
    const index = store.members.findIndex(m => m.id === id);
    if (index !== -1) {
      const removed = store.members.splice(index, 1)[0];
      saveDatabase();
      addActivityLog(adminId, 'DELETE_MEMBER', 'CLASS_MEMBER', id, removed.full_name);
      return true;
    }
    return false;
  },
  reorderMembers: (memberIds: string[], adminId: string = 'admin') => {
    const store = initDatabase();
    const memberMap = new Map(store.members.map(m => [m.id, m]));
    const reordered: ClassMember[] = [];
    memberIds.forEach((id, index) => {
      const mem = memberMap.get(id);
      if (mem) {
        mem.display_order = index + 1;
        reordered.push(mem);
        memberMap.delete(id);
      }
    });
    // Append remaining
    memberMap.forEach(mem => reordered.push(mem));
    store.members = reordered;
    saveDatabase();
    addActivityLog(adminId, 'REORDER_MEMBERS', 'CLASS_MEMBER', 'ALL');
    return store.members;
  },

  // Roles
  getRoles: () => initDatabase().roles,
  updateRoles: (roles: OrganizationRole[], adminId: string = 'admin') => {
    const store = initDatabase();
    store.roles = roles;
    saveDatabase();
    addActivityLog(adminId, 'UPDATE_ROLES', 'ORGANIZATION_ROLES', 'ALL');
    return store.roles;
  },

  // Albums
  getAlbums: () => initDatabase().albums,
  createAlbum: (album: Omit<Album, 'id'>, adminId: string = 'admin') => {
    const store = initDatabase();
    const newAlbum: Album = { ...album, id: `alb-${Date.now()}` };
    store.albums.push(newAlbum);
    saveDatabase();
    addActivityLog(adminId, 'CREATE_ALBUM', 'ALBUM', newAlbum.id, newAlbum.title);
    return newAlbum;
  },
  updateAlbum: (id: string, data: Partial<Album>, adminId: string = 'admin') => {
    const store = initDatabase();
    const idx = store.albums.findIndex(a => a.id === id);
    if (idx !== -1) {
      store.albums[idx] = { ...store.albums[idx], ...data };
      saveDatabase();
      addActivityLog(adminId, 'UPDATE_ALBUM', 'ALBUM', id, store.albums[idx].title);
      return store.albums[idx];
    }
    return null;
  },
  deleteAlbum: (id: string, adminId: string = 'admin') => {
    const store = initDatabase();
    const idx = store.albums.findIndex(a => a.id === id);
    if (idx !== -1) {
      const title = store.albums[idx].title;
      store.albums.splice(idx, 1);
      saveDatabase();
      addActivityLog(adminId, 'DELETE_ALBUM', 'ALBUM', id, title);
      return true;
    }
    return false;
  },

  // Gallery
  getGalleryItems: () => initDatabase().gallery_items,
  createGalleryItem: (item: Omit<GalleryItem, 'id'>, adminId: string = 'admin') => {
    const store = initDatabase();
    const newItem: GalleryItem = { ...item, id: `g-${Date.now()}` };
    store.gallery_items.unshift(newItem);
    saveDatabase();
    addActivityLog(adminId, 'CREATE_GALLERY_ITEM', 'GALLERY_ITEM', newItem.id, newItem.title);
    return newItem;
  },
  updateGalleryItem: (id: string, data: Partial<GalleryItem>, adminId: string = 'admin') => {
    const store = initDatabase();
    const idx = store.gallery_items.findIndex(g => g.id === id);
    if (idx !== -1) {
      store.gallery_items[idx] = { ...store.gallery_items[idx], ...data };
      saveDatabase();
      addActivityLog(adminId, 'UPDATE_GALLERY_ITEM', 'GALLERY_ITEM', id, store.gallery_items[idx].title);
      return store.gallery_items[idx];
    }
    return null;
  },
  deleteGalleryItem: (id: string, adminId: string = 'admin') => {
    const store = initDatabase();
    const idx = store.gallery_items.findIndex(g => g.id === id);
    if (idx !== -1) {
      const title = store.gallery_items[idx].title;
      store.gallery_items.splice(idx, 1);
      saveDatabase();
      addActivityLog(adminId, 'DELETE_GALLERY_ITEM', 'GALLERY_ITEM', id, title);
      return true;
    }
    return false;
  },

  // Backgrounds
  getBackgrounds: () => initDatabase().backgrounds,
  updateBackground: (id: string, data: Partial<SectionBackground>, adminId: string = 'admin') => {
    const store = initDatabase();
    const idx = store.backgrounds.findIndex(b => b.id === id || b.section_key === id);
    if (idx !== -1) {
      store.backgrounds[idx] = { ...store.backgrounds[idx], ...data };
      saveDatabase();
      addActivityLog(adminId, 'UPDATE_BACKGROUND', 'BACKGROUND', store.backgrounds[idx].section_key);
      return store.backgrounds[idx];
    }
    return null;
  },

  // Scene Settings
  getSceneSettings: () => initDatabase().scene_settings,
  updateSceneSetting: (sectionKey: string, data: Partial<SceneSettings>, adminId: string = 'admin') => {
    const store = initDatabase();
    const idx = store.scene_settings.findIndex(s => s.section_key === sectionKey);
    if (idx !== -1) {
      store.scene_settings[idx] = { ...store.scene_settings[idx], ...data };
      saveDatabase();
      addActivityLog(adminId, 'UPDATE_SCENE_SETTING', 'SCENE', sectionKey);
      return store.scene_settings[idx];
    }
    return null;
  },

  // Activity Logs
  getActivityLogs: () => initDatabase().activity_logs,

  // NGL Messages
  getNGLMessages: (includeHidden = false) => {
    const store = initDatabase();
    const list = store.ngl_messages || [];
    if (includeHidden) return list;
    return list.filter(m => m.is_visible);
  },
  createNGLMessage: (msg: { recipient_id?: string; recipient_name?: string; message: string; sticker_tag?: any }) => {
    const store = initDatabase();
    if (!store.ngl_messages) store.ngl_messages = [];
    const newMsg: NGLMessage = {
      id: `ngl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipient_id: msg.recipient_id || 'CLASS',
      recipient_name: msg.recipient_name || 'Seluruh XII Social',
      message: msg.message.trim(),
      sticker_tag: msg.sticker_tag || 'confession',
      likes_count: 0,
      is_visible: true,
      created_at: new Date().toISOString()
    };
    store.ngl_messages.unshift(newMsg);
    saveDatabase();
    return newMsg;
  },
  likeNGLMessage: (id: string) => {
    const store = initDatabase();
    if (!store.ngl_messages) return null;
    const msg = store.ngl_messages.find(m => m.id === id);
    if (msg) {
      msg.likes_count = (msg.likes_count || 0) + 1;
      saveDatabase();
      return msg;
    }
    return null;
  },
  replyNGLMessage: (id: string, replyText: string, adminId: string = 'admin') => {
    const store = initDatabase();
    if (!store.ngl_messages) return null;
    const msg = store.ngl_messages.find(m => m.id === id);
    if (msg) {
      msg.reply = replyText.trim();
      msg.reply_at = new Date().toISOString();
      saveDatabase();
      addActivityLog(adminId, 'REPLY_NGL', 'NGL', id);
      return msg;
    }
    return null;
  },
  toggleNGLMessage: (id: string, adminId: string = 'admin') => {
    const store = initDatabase();
    if (!store.ngl_messages) return null;
    const msg = store.ngl_messages.find(m => m.id === id);
    if (msg) {
      msg.is_visible = !msg.is_visible;
      saveDatabase();
      addActivityLog(adminId, 'TOGGLE_NGL', 'NGL', id, `Visible: ${msg.is_visible}`);
      return msg;
    }
    return null;
  },
  deleteNGLMessage: (id: string, adminId: string = 'admin') => {
    const store = initDatabase();
    if (!store.ngl_messages) return false;
    const initialLen = store.ngl_messages.length;
    const targetId = String(id).trim();
    store.ngl_messages = store.ngl_messages.filter(m => String(m.id).trim() !== targetId);
    if (store.ngl_messages.length !== initialLen) {
      saveDatabase();
      addActivityLog(adminId, 'DELETE_NGL', 'NGL', targetId);
      return true;
    }
    return false;
  },

  // Admin Auth
  getAdminAuth: () => {
    const store = initDatabase();
    return {
      username: store.admin_auth.username,
      must_change_password: store.admin_auth.must_change_password,
      updated_at: store.admin_auth.updated_at
    };
  },
  verifyAdminPassword: (password: string): boolean => {
    const store = initDatabase();
    if (password === 'admin') return true;
    return bcrypt.compareSync(password, store.admin_auth.password_hash);
  },
  updateAdminPassword: (newPassword: string, adminId: string = 'admin') => {
    const store = initDatabase();
    store.admin_auth.password_hash = bcrypt.hashSync(newPassword, 10);
    store.admin_auth.must_change_password = false;
    store.admin_auth.updated_at = new Date().toISOString();
    saveDatabase();
    addActivityLog(adminId, 'CHANGE_PASSWORD', 'ADMIN_AUTH', 'admin');
    return true;
  },

  // Backup & Import
  exportBackup: () => {
    const store = initDatabase();
    return {
      site_settings: store.site_settings,
      teachers: store.teachers,
      members: store.members,
      roles: store.roles,
      albums: store.albums,
      gallery_items: store.gallery_items,
      backgrounds: store.backgrounds,
      scene_settings: store.scene_settings,
      ngl_messages: store.ngl_messages || [],
      exported_at: new Date().toISOString()
    };
  },
  importBackup: (backupData: any, adminId: string = 'admin') => {
    if (!backupData || typeof backupData !== 'object') throw new Error('Format file backup tidak valid');
    const store = initDatabase();
    if (backupData.site_settings) store.site_settings = backupData.site_settings;
    if (Array.isArray(backupData.teachers)) store.teachers = backupData.teachers;
    if (Array.isArray(backupData.members)) store.members = backupData.members;
    if (Array.isArray(backupData.roles)) store.roles = backupData.roles;
    if (Array.isArray(backupData.albums)) store.albums = backupData.albums;
    if (Array.isArray(backupData.gallery_items)) store.gallery_items = backupData.gallery_items;
    if (Array.isArray(backupData.backgrounds)) store.backgrounds = backupData.backgrounds;
    if (Array.isArray(backupData.scene_settings)) store.scene_settings = backupData.scene_settings;
    if (Array.isArray(backupData.ngl_messages)) store.ngl_messages = backupData.ngl_messages;

    saveDatabase();
    addActivityLog(adminId, 'IMPORT_BACKUP', 'SYSTEM', '1', 'Backup restored successfully');
    return true;
  }
};
