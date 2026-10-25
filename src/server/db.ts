import bcrypt from 'bcryptjs';
import { and, desc, eq, gt, lt, sql } from 'drizzle-orm';
import { db as database } from '../../db/index.js';
import { adminSessions, nglMessages, siteContent } from '../../db/schema.js';
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

interface ContentStore {
  site_settings: SiteSettings;
  teachers: Teacher[];
  members: ClassMember[];
  roles: OrganizationRole[];
  albums: Album[];
  gallery_items: GalleryItem[];
  backgrounds: SectionBackground[];
  scene_settings: SceneSettings[];
  activity_logs: ActivityLog[];
  admin_auth: AdminAuthStore;
  version: number;
}

const STORE_ID = 'main';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

function seedNGLMessages(): NGLMessage[] {
  return [
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
}

function seedStore(): ContentStore {
  return {
    site_settings: initialSiteSettings,
    teachers: initialTeachers,
    members: initialMembers,
    roles: initialRoles,
    albums: initialAlbums,
    gallery_items: initialGalleryItems,
    backgrounds: initialSectionBackgrounds,
    scene_settings: initialSceneSettings,
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
      password_hash: bcrypt.hashSync('admin', 10),
      must_change_password: true,
      updated_at: new Date().toISOString()
    },
    version: 1
  };
}

function nglValues(msg: NGLMessage) {
  return {
    id: msg.id,
    recipientId: msg.recipient_id || 'CLASS',
    recipientName: msg.recipient_name || 'Seluruh XII Social',
    message: msg.message,
    stickerTag: msg.sticker_tag || 'confession',
    reply: msg.reply ?? null,
    replyAt: msg.reply_at ? new Date(msg.reply_at) : null,
    likesCount: msg.likes_count || 0,
    isVisible: msg.is_visible !== false,
    createdAt: msg.created_at ? new Date(msg.created_at) : new Date()
  };
}

function toNGLMessage(row: typeof nglMessages.$inferSelect): NGLMessage {
  return {
    id: row.id,
    recipient_id: row.recipientId,
    recipient_name: row.recipientName,
    message: row.message,
    sticker_tag: row.stickerTag as NGLMessage['sticker_tag'],
    reply: row.reply ?? undefined,
    reply_at: row.replyAt ? row.replyAt.toISOString() : undefined,
    likes_count: row.likesCount,
    is_visible: row.isVisible,
    created_at: row.createdAt.toISOString()
  };
}

// Creates the content document (and the starter NGL messages) the first time the site runs.
let seeded = false;
async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const existing = await database.select({ id: siteContent.id }).from(siteContent).where(eq(siteContent.id, STORE_ID));
  if (existing.length === 0) {
    const inserted = await database
      .insert(siteContent)
      .values({ id: STORE_ID, data: seedStore() })
      .onConflictDoNothing()
      .returning({ id: siteContent.id });
    if (inserted.length > 0) {
      await database.insert(nglMessages).values(seedNGLMessages().map(nglValues)).onConflictDoNothing();
    }
  }
  seeded = true;
}

async function readStore(): Promise<ContentStore> {
  await ensureSeeded();
  const [row] = await database.select().from(siteContent).where(eq(siteContent.id, STORE_ID));
  return row.data as ContentStore;
}

// Runs a change against the content document inside a locked transaction so concurrent edits don't overwrite each other.
async function mutateStore<T>(mutator: (store: ContentStore) => T): Promise<T> {
  await ensureSeeded();
  return database.transaction(async (tx) => {
    const [row] = await tx.select().from(siteContent).where(eq(siteContent.id, STORE_ID)).for('update');
    const store = row.data as ContentStore;
    const result = mutator(store);
    await tx.update(siteContent).set({ data: store, updatedAt: new Date() }).where(eq(siteContent.id, STORE_ID));
    return result;
  });
}

function addActivityLog(store: ContentStore, adminId: string, action: string, entityType: string, entityId: string, metadata?: string) {
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
}

async function logActivity(adminId: string, action: string, entityType: string, entityId: string, metadata?: string) {
  await mutateStore(store => addActivityLog(store, adminId, action, entityType, entityId, metadata));
}

async function getNGLMessages(includeHidden = false): Promise<NGLMessage[]> {
  await ensureSeeded();
  const rows = includeHidden
    ? await database.select().from(nglMessages).orderBy(desc(nglMessages.createdAt))
    : await database.select().from(nglMessages).where(eq(nglMessages.isVisible, true)).orderBy(desc(nglMessages.createdAt));
  return rows.map(toNGLMessage);
}

export const db = {
  getStore: () => readStore(),
  getNGLMessages,

  // Site Settings
  updateSiteSettings: (settings: Partial<SiteSettings>, adminId: string = 'admin') =>
    mutateStore(store => {
      store.site_settings = { ...store.site_settings, ...settings };
      addActivityLog(store, adminId, 'UPDATE_SITE_SETTINGS', 'SITE_SETTINGS', '1');
      return store.site_settings;
    }),

  // Teachers
  updateTeachers: (teachers: Teacher[], adminId: string = 'admin') =>
    mutateStore(store => {
      store.teachers = teachers;
      addActivityLog(store, adminId, 'UPDATE_TEACHERS', 'TEACHERS', '1');
      return store.teachers;
    }),

  // Members
  createMember: (memberData: Omit<ClassMember, 'id'>, adminId: string = 'admin') =>
    mutateStore(store => {
      const newMember: ClassMember = {
        ...memberData,
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      };
      store.members.push(newMember);
      addActivityLog(store, adminId, 'CREATE_MEMBER', 'CLASS_MEMBER', newMember.id, newMember.full_name);
      return newMember;
    }),
  updateMember: (id: string, memberData: Partial<ClassMember>, adminId: string = 'admin') =>
    mutateStore(store => {
      const index = store.members.findIndex(m => m.id === id);
      if (index === -1) return null;
      store.members[index] = { ...store.members[index], ...memberData };
      addActivityLog(store, adminId, 'UPDATE_MEMBER', 'CLASS_MEMBER', id, store.members[index].full_name);
      return store.members[index];
    }),
  deleteMember: (id: string, adminId: string = 'admin') =>
    mutateStore(store => {
      const index = store.members.findIndex(m => m.id === id);
      if (index === -1) return false;
      const removed = store.members.splice(index, 1)[0];
      addActivityLog(store, adminId, 'DELETE_MEMBER', 'CLASS_MEMBER', id, removed.full_name);
      return true;
    }),
  reorderMembers: (memberIds: string[], adminId: string = 'admin') =>
    mutateStore(store => {
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
      addActivityLog(store, adminId, 'REORDER_MEMBERS', 'CLASS_MEMBER', 'ALL');
      return store.members;
    }),
  importMembers: (members: any[], adminId: string = 'admin') =>
    mutateStore(store => {
      let count = 0;
      members.forEach(m => {
        if (!m || !m.full_name) return;
        const newMember: ClassMember = {
          id: `m-${Date.now()}-${count}-${Math.random().toString(36).substring(2, 6)}`,
          full_name: m.full_name,
          nickname: m.nickname || m.full_name.split(' ')[0],
          photo_url: m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
          birth_information: m.birth_information || '',
          motto: m.motto || 'Semangat melangkah bersama XII Social!',
          memory_message: m.memory_message || 'Terima kasih atas semua kenangan manis di MAN 3 Banjar.',
          hobby: m.hobby || '',
          dream: m.dream || '',
          social_url: m.social_url || '',
          is_officer: !!m.is_officer,
          officer_role: m.officer_role || '',
          display_order: store.members.length + 1,
          is_visible: true
        };
        store.members.push(newMember);
        count++;
      });
      addActivityLog(store, adminId, 'IMPORT_MEMBERS', 'CLASS_MEMBER', 'ALL', `${count} anggota diimpor`);
      return count;
    }),

  // Roles
  updateRoles: (roles: OrganizationRole[], adminId: string = 'admin') =>
    mutateStore(store => {
      store.roles = roles;
      addActivityLog(store, adminId, 'UPDATE_ROLES', 'ORGANIZATION_ROLES', 'ALL');
      return store.roles;
    }),

  // Albums
  createAlbum: (album: Omit<Album, 'id'>, adminId: string = 'admin') =>
    mutateStore(store => {
      const newAlbum: Album = { ...album, id: `alb-${Date.now()}` };
      store.albums.push(newAlbum);
      addActivityLog(store, adminId, 'CREATE_ALBUM', 'ALBUM', newAlbum.id, newAlbum.title);
      return newAlbum;
    }),
  updateAlbum: (id: string, data: Partial<Album>, adminId: string = 'admin') =>
    mutateStore(store => {
      const idx = store.albums.findIndex(a => a.id === id);
      if (idx === -1) return null;
      store.albums[idx] = { ...store.albums[idx], ...data };
      addActivityLog(store, adminId, 'UPDATE_ALBUM', 'ALBUM', id, store.albums[idx].title);
      return store.albums[idx];
    }),
  deleteAlbum: (id: string, adminId: string = 'admin') =>
    mutateStore(store => {
      const idx = store.albums.findIndex(a => a.id === id);
      if (idx === -1) return false;
      const title = store.albums[idx].title;
      store.albums.splice(idx, 1);
      addActivityLog(store, adminId, 'DELETE_ALBUM', 'ALBUM', id, title);
      return true;
    }),

  // Gallery
  createGalleryItem: (item: Omit<GalleryItem, 'id'>, adminId: string = 'admin') =>
    mutateStore(store => {
      const newItem: GalleryItem = { ...item, id: `g-${Date.now()}` };
      store.gallery_items.unshift(newItem);
      addActivityLog(store, adminId, 'CREATE_GALLERY_ITEM', 'GALLERY_ITEM', newItem.id, newItem.title);
      return newItem;
    }),
  updateGalleryItem: (id: string, data: Partial<GalleryItem>, adminId: string = 'admin') =>
    mutateStore(store => {
      const idx = store.gallery_items.findIndex(g => g.id === id);
      if (idx === -1) return null;
      store.gallery_items[idx] = { ...store.gallery_items[idx], ...data };
      addActivityLog(store, adminId, 'UPDATE_GALLERY_ITEM', 'GALLERY_ITEM', id, store.gallery_items[idx].title);
      return store.gallery_items[idx];
    }),
  deleteGalleryItem: (id: string, adminId: string = 'admin') =>
    mutateStore(store => {
      const idx = store.gallery_items.findIndex(g => g.id === id);
      if (idx === -1) return false;
      const title = store.gallery_items[idx].title;
      store.gallery_items.splice(idx, 1);
      addActivityLog(store, adminId, 'DELETE_GALLERY_ITEM', 'GALLERY_ITEM', id, title);
      return true;
    }),

  // Backgrounds
  updateBackground: (id: string, data: Partial<SectionBackground>, adminId: string = 'admin') =>
    mutateStore(store => {
      const idx = store.backgrounds.findIndex(b => b.id === id || b.section_key === id);
      if (idx === -1) return null;
      store.backgrounds[idx] = { ...store.backgrounds[idx], ...data };
      addActivityLog(store, adminId, 'UPDATE_BACKGROUND', 'BACKGROUND', store.backgrounds[idx].section_key);
      return store.backgrounds[idx];
    }),

  // Scene Settings
  updateSceneSetting: (sectionKey: string, data: Partial<SceneSettings>, adminId: string = 'admin') =>
    mutateStore(store => {
      const idx = store.scene_settings.findIndex(s => s.section_key === sectionKey);
      if (idx === -1) return null;
      store.scene_settings[idx] = { ...store.scene_settings[idx], ...data };
      addActivityLog(store, adminId, 'UPDATE_SCENE_SETTING', 'SCENE', sectionKey);
      return store.scene_settings[idx];
    }),

  // Activity Logs
  getActivityLogs: async () => (await readStore()).activity_logs,

  // NGL Messages
  createNGLMessage: async (msg: { recipient_id?: string; recipient_name?: string; message: string; sticker_tag?: any }) => {
    await ensureSeeded();
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
    const [row] = await database.insert(nglMessages).values(nglValues(newMsg)).returning();
    return toNGLMessage(row);
  },
  likeNGLMessage: async (id: string) => {
    const [row] = await database
      .update(nglMessages)
      .set({ likesCount: sql`${nglMessages.likesCount} + 1` })
      .where(eq(nglMessages.id, id))
      .returning();
    return row ? toNGLMessage(row) : null;
  },
  replyNGLMessage: async (id: string, replyText: string, adminId: string = 'admin') => {
    const [row] = await database
      .update(nglMessages)
      .set({ reply: replyText.trim(), replyAt: new Date() })
      .where(eq(nglMessages.id, id))
      .returning();
    if (!row) return null;
    await logActivity(adminId, 'REPLY_NGL', 'NGL', id);
    return toNGLMessage(row);
  },
  toggleNGLMessage: async (id: string, adminId: string = 'admin') => {
    const [row] = await database
      .update(nglMessages)
      .set({ isVisible: sql`NOT ${nglMessages.isVisible}` })
      .where(eq(nglMessages.id, id))
      .returning();
    if (!row) return null;
    await logActivity(adminId, 'TOGGLE_NGL', 'NGL', id, `Visible: ${row.isVisible}`);
    return toNGLMessage(row);
  },
  deleteNGLMessage: async (id: string, adminId: string = 'admin') => {
    const targetId = String(id).trim();
    const deleted = await database.delete(nglMessages).where(eq(nglMessages.id, targetId)).returning({ id: nglMessages.id });
    if (deleted.length === 0) return false;
    await logActivity(adminId, 'DELETE_NGL', 'NGL', targetId);
    return true;
  },

  // Admin Auth
  getAdminAuth: async () => {
    const store = await readStore();
    return {
      username: store.admin_auth.username,
      must_change_password: store.admin_auth.must_change_password,
      updated_at: store.admin_auth.updated_at
    };
  },
  verifyAdminPassword: async (password: string): Promise<boolean> => {
    const store = await readStore();
    return bcrypt.compare(password, store.admin_auth.password_hash);
  },
  updateAdminPassword: async (newPassword: string, adminId: string = 'admin') => {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return mutateStore(store => {
      store.admin_auth.password_hash = passwordHash;
      store.admin_auth.must_change_password = false;
      store.admin_auth.updated_at = new Date().toISOString();
      addActivityLog(store, adminId, 'CHANGE_PASSWORD', 'ADMIN_AUTH', 'admin');
      return true;
    });
  },

  // Admin Sessions
  createSession: async (): Promise<string> => {
    const token = 'sess_' + crypto.randomUUID().replace(/-/g, '');
    await database.insert(adminSessions).values({ token, expiresAt: new Date(Date.now() + SESSION_DURATION_MS) });
    await database.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
    return token;
  },
  verifySession: async (token: string | null | undefined): Promise<boolean> => {
    if (!token) return false;
    const rows = await database
      .select({ token: adminSessions.token })
      .from(adminSessions)
      .where(and(eq(adminSessions.token, token), gt(adminSessions.expiresAt, new Date())));
    return rows.length > 0;
  },
  deleteSession: async (token: string) => {
    await database.delete(adminSessions).where(eq(adminSessions.token, token));
  },

  // Backup & Import
  exportBackup: async () => {
    const store = await readStore();
    return {
      site_settings: store.site_settings,
      teachers: store.teachers,
      members: store.members,
      roles: store.roles,
      albums: store.albums,
      gallery_items: store.gallery_items,
      backgrounds: store.backgrounds,
      scene_settings: store.scene_settings,
      ngl_messages: await getNGLMessages(true),
      exported_at: new Date().toISOString()
    };
  },
  importBackup: async (backupData: any, adminId: string = 'admin') => {
    if (!backupData || typeof backupData !== 'object') throw new Error('Format file backup tidak valid');
    await mutateStore(store => {
      if (backupData.site_settings) store.site_settings = backupData.site_settings;
      if (Array.isArray(backupData.teachers)) store.teachers = backupData.teachers;
      if (Array.isArray(backupData.members)) store.members = backupData.members;
      if (Array.isArray(backupData.roles)) store.roles = backupData.roles;
      if (Array.isArray(backupData.albums)) store.albums = backupData.albums;
      if (Array.isArray(backupData.gallery_items)) store.gallery_items = backupData.gallery_items;
      if (Array.isArray(backupData.backgrounds)) store.backgrounds = backupData.backgrounds;
      if (Array.isArray(backupData.scene_settings)) store.scene_settings = backupData.scene_settings;
      addActivityLog(store, adminId, 'IMPORT_BACKUP', 'SYSTEM', '1', 'Backup restored successfully');
    });
    if (Array.isArray(backupData.ngl_messages)) {
      const restored = (backupData.ngl_messages as NGLMessage[]).filter(m => m && m.id && m.message).map(nglValues);
      await database.transaction(async (tx) => {
        await tx.delete(nglMessages);
        if (restored.length > 0) await tx.insert(nglMessages).values(restored);
      });
    }
    return true;
  }
};
