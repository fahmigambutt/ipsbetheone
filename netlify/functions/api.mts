import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { db } from '../../src/server/db.js';

type Params = Record<string, string>;
type Handler = (req: Request, params: Params) => Promise<Response>;

interface Route {
  method: string;
  segments: string[];
  handler: Handler;
  admin: boolean;
}

interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // Function request bodies are limited to ~6MB
const ALLOWED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp3',
  'application/json'
];

// Best-effort, per-instance login rate limiting
const loginRateLimits = new Map<string, RateLimitRecord>();

function json(body: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(body, { status, headers });
}

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function getSessionToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  return req.headers.get('x-admin-token') || bearerToken || getCookie(req, 'xii_session');
}

async function readJson(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

const routes: Route[] = [];
function route(method: string, pathname: string, handler: Handler, admin = false) {
  routes.push({ method, segments: pathname.split('/'), handler, admin });
}

function matchRoute(segments: string[], pathname: string): Params | null {
  const parts = pathname.replace(/\/+$/, '').split('/');
  if (parts.length !== segments.length) return null;
  const params: Params = {};
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].startsWith(':')) {
      if (!parts[i]) return null;
      params[segments[i].substring(1)] = decodeURIComponent(parts[i]);
    } else if (segments[i] !== parts[i]) {
      return null;
    }
  }
  return params;
}

// ------------------- AUTH ENDPOINTS -------------------
route('POST', '/api/auth/login', async (req) => {
  const { username, password } = await readJson(req);
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return json({ success: false, message: 'Username dan password wajib diisi.' }, 400);
  }

  const clientIp = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const rateLimit = loginRateLimits.get(clientIp);

  if (rateLimit && rateLimit.blockedUntil > now) {
    const remainingMinutes = Math.ceil((rateLimit.blockedUntil - now) / 60000);
    return json({
      success: false,
      message: `Terlalu banyak percobaan login yang gagal. Akses diblokir sementara. Coba lagi dalam ${remainingMinutes} menit.`
    }, 429);
  }

  const auth = await db.getAdminAuth();
  if (username !== auth.username || !(await db.verifyAdminPassword(password))) {
    const currentRecord = rateLimit || { attempts: 0, blockedUntil: 0 };
    currentRecord.attempts += 1;
    if (currentRecord.attempts >= MAX_LOGIN_ATTEMPTS) {
      currentRecord.blockedUntil = now + BLOCK_DURATION_MS;
      currentRecord.attempts = 0;
    }
    loginRateLimits.set(clientIp, currentRecord);

    const remainingAttempts = MAX_LOGIN_ATTEMPTS - currentRecord.attempts;
    return json({
      success: false,
      message: remainingAttempts > 0 && remainingAttempts < MAX_LOGIN_ATTEMPTS
        ? `Username atau password salah. Sisa percobaan: ${remainingAttempts}.`
        : 'Terlalu banyak percobaan gagal. Akun diblokir sementara selama 15 menit.'
    }, 401);
  }

  // Clear rate limit record on successful login
  loginRateLimits.delete(clientIp);

  const token = await db.createSession();
  return json(
    {
      success: true,
      message: 'Login berhasil.',
      must_change_password: auth.must_change_password,
      token
    },
    200,
    { 'Set-Cookie': `xii_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400` }
  );
});

route('POST', '/api/auth/logout', async (req) => {
  const token = getSessionToken(req);
  if (token) await db.deleteSession(token);
  return json(
    { success: true, message: 'Berhasil keluar.' },
    200,
    { 'Set-Cookie': 'xii_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' }
  );
});

route('GET', '/api/auth/me', async (req) => {
  const isValid = await db.verifySession(getSessionToken(req));
  const auth = await db.getAdminAuth();
  return json({
    authenticated: isValid,
    must_change_password: auth.must_change_password,
    username: auth.username
  });
});

route('POST', '/api/auth/change-password', async (req) => {
  const { current_password, new_password } = await readJson(req);
  if (!current_password || !new_password || typeof new_password !== 'string' || new_password.length < 6) {
    return json({ success: false, message: 'Password baru minimal 6 karakter.' }, 400);
  }

  if (!(await db.verifyAdminPassword(current_password))) {
    return json({ success: false, message: 'Password saat ini salah.' }, 400);
  }

  await db.updateAdminPassword(new_password);
  return json({ success: true, message: 'Password berhasil diperbarui.' });
}, true);

// ------------------- PUBLIC ENDPOINTS -------------------
route('GET', '/api/public/all', async () => {
  const store = await db.getStore();

  if (store.site_settings.maintenance_settings?.enabled) {
    return json({
      maintenance: true,
      maintenance_message: store.site_settings.maintenance_settings.message,
      site_settings: {
        site_title: store.site_settings.site_title,
        school_name: store.site_settings.school_name,
        class_name: store.site_settings.class_name
      }
    });
  }

  // Filter visible items
  const teachers = store.teachers.filter(t => t.is_visible);
  const members = store.members
    .filter(m => m.is_visible)
    .sort((a, b) => a.display_order - b.display_order);
  const roles = store.roles
    .filter(r => r.is_visible)
    .sort((a, b) => a.display_order - b.display_order);
  const albums = store.albums
    .filter(a => a.is_visible)
    .sort((a, b) => a.display_order - b.display_order);
  const gallery_items = store.gallery_items
    .filter(g => g.is_visible)
    .sort((a, b) => a.display_order - b.display_order);
  const backgrounds = store.backgrounds.filter(b => b.is_visible);
  const scene_settings = store.scene_settings.filter(s => s.is_enabled);
  const ngl_messages = await db.getNGLMessages(false);

  return json({
    maintenance: false,
    site_settings: store.site_settings,
    teachers,
    members,
    roles,
    albums,
    gallery_items,
    backgrounds,
    scene_settings,
    ngl_messages
  });
});

// ------------------- NGL / ANONYMOUS MESSAGE ENDPOINTS -------------------
route('GET', '/api/ngl-messages', async () => {
  return json({ success: true, data: await db.getNGLMessages(false) });
});

route('POST', '/api/ngl-messages', async (req) => {
  const { recipient_id, recipient_name, message, sticker_tag } = await readJson(req);
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return json({ success: false, message: 'Pesan rahasia tidak boleh kosong.' }, 400);
  }
  if (message.trim().length > 350) {
    return json({ success: false, message: 'Pesan terlalu panjang (maksimal 350 karakter).' }, 400);
  }

  const newMsg = await db.createNGLMessage({
    recipient_id: typeof recipient_id === 'string' ? recipient_id : undefined,
    recipient_name: typeof recipient_name === 'string' ? recipient_name : undefined,
    message,
    sticker_tag: typeof sticker_tag === 'string' ? sticker_tag : undefined
  });

  return json({ success: true, data: newMsg });
});

route('POST', '/api/ngl-messages/:id/like', async (_req, params) => {
  const updated = await db.likeNGLMessage(params.id);
  if (!updated) return json({ success: false, message: 'Pesan tidak ditemukan.' }, 404);
  return json({ success: true, data: updated });
});

// ------------------- ADMIN ENDPOINTS -------------------
route('GET', '/api/admin/all', async () => {
  const store = await db.getStore();
  return json({
    site_settings: store.site_settings,
    teachers: store.teachers,
    members: store.members,
    roles: store.roles,
    albums: store.albums,
    gallery_items: store.gallery_items,
    backgrounds: store.backgrounds,
    scene_settings: store.scene_settings,
    activity_logs: store.activity_logs,
    ngl_messages: await db.getNGLMessages(true)
  });
}, true);

route('POST', '/api/admin/ngl-messages/:id/reply', async (req, params) => {
  const { reply } = await readJson(req);
  if (!reply || typeof reply !== 'string') {
    return json({ success: false, message: 'Balasan tidak boleh kosong.' }, 400);
  }
  const updated = await db.replyNGLMessage(params.id, reply);
  if (!updated) return json({ success: false, message: 'Pesan tidak ditemukan.' }, 404);
  return json({ success: true, data: updated });
}, true);

route('PATCH', '/api/admin/ngl-messages/:id/toggle', async (_req, params) => {
  const updated = await db.toggleNGLMessage(params.id);
  if (!updated) return json({ success: false, message: 'Pesan tidak ditemukan.' }, 404);
  return json({ success: true, data: updated });
}, true);

route('DELETE', '/api/admin/ngl-messages/:id', async (_req, params) => {
  const deleted = await db.deleteNGLMessage(params.id);
  if (!deleted) {
    return json({ success: false, message: 'Pesan tidak ditemukan atau sudah dihapus.' }, 404);
  }
  return json({ success: true, message: 'Pesan rahasia berhasil dihapus.' });
}, true);

route('PUT', '/api/admin/site-settings', async (req) => {
  return json({ success: true, data: await db.updateSiteSettings(await readJson(req)) });
}, true);

route('PUT', '/api/admin/teachers', async (req) => {
  return json({ success: true, data: await db.updateTeachers(await readJson(req)) });
}, true);

route('POST', '/api/admin/members', async (req) => {
  return json({ success: true, data: await db.createMember(await readJson(req)) });
}, true);

route('POST', '/api/admin/members/reorder', async (req) => {
  const { member_ids } = await readJson(req);
  if (!Array.isArray(member_ids)) return json({ success: false, message: 'Daftar ID tidak valid.' }, 400);
  return json({ success: true, data: await db.reorderMembers(member_ids) });
}, true);

route('POST', '/api/admin/members/import', async (req) => {
  const { members } = await readJson(req);
  if (!Array.isArray(members)) return json({ success: false, message: 'Format data import tidak valid.' }, 400);
  const count = await db.importMembers(members);
  return json({ success: true, count, message: `${count} anggota berhasil diimpor.` });
}, true);

route('PUT', '/api/admin/members/:id', async (req, params) => {
  const updated = await db.updateMember(params.id, await readJson(req));
  if (!updated) return json({ success: false, message: 'Anggota tidak ditemukan.' }, 404);
  return json({ success: true, data: updated });
}, true);

route('DELETE', '/api/admin/members/:id', async (_req, params) => {
  return json({ success: await db.deleteMember(params.id) });
}, true);

route('PUT', '/api/admin/roles', async (req) => {
  return json({ success: true, data: await db.updateRoles(await readJson(req)) });
}, true);

route('POST', '/api/admin/albums', async (req) => {
  return json({ success: true, data: await db.createAlbum(await readJson(req)) });
}, true);

route('PUT', '/api/admin/albums/:id', async (req, params) => {
  return json({ success: true, data: await db.updateAlbum(params.id, await readJson(req)) });
}, true);

route('DELETE', '/api/admin/albums/:id', async (_req, params) => {
  return json({ success: await db.deleteAlbum(params.id) });
}, true);

route('POST', '/api/admin/gallery', async (req) => {
  return json({ success: true, data: await db.createGalleryItem(await readJson(req)) });
}, true);

route('PUT', '/api/admin/gallery/:id', async (req, params) => {
  return json({ success: true, data: await db.updateGalleryItem(params.id, await readJson(req)) });
}, true);

route('DELETE', '/api/admin/gallery/:id', async (_req, params) => {
  return json({ success: await db.deleteGalleryItem(params.id) });
}, true);

route('PUT', '/api/admin/backgrounds/:id', async (req, params) => {
  return json({ success: true, data: await db.updateBackground(params.id, await readJson(req)) });
}, true);

route('PUT', '/api/admin/scene-settings/:sectionKey', async (req, params) => {
  return json({ success: true, data: await db.updateSceneSetting(params.sectionKey, await readJson(req)) });
}, true);

route('GET', '/api/admin/activity-logs', async () => {
  return json({ success: true, data: await db.getActivityLogs() });
}, true);

route('GET', '/api/admin/backup', async () => {
  const backup = await db.exportBackup();
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename=XII_SOCIAL_BACKUP_${Date.now()}.json`
    }
  });
}, true);

route('POST', '/api/admin/backup/restore', async (req) => {
  try {
    await db.importBackup(await readJson(req));
    return json({ success: true, message: 'Data berhasil dipulihkan.' });
  } catch (err: any) {
    return json({ success: false, message: err.message || 'Gagal memulihkan backup.' }, 400);
  }
}, true);

// Upload endpoint — files are stored in Netlify Blobs and served from /uploads/:key
route('POST', '/api/upload', async (req) => {
  let file: FormDataEntryValue | null = null;
  try {
    file = (await req.formData()).get('file');
  } catch {
    file = null;
  }
  if (!file || typeof file === 'string') {
    return json({ success: false, message: 'Tidak ada file yang diunggah.' }, 400);
  }

  const name = file.name || 'file';
  const lowerName = name.toLowerCase();
  const isModel = lowerName.endsWith('.glb') || lowerName.endsWith('.gltf');
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type) && !isModel) {
    return json({ success: false, message: 'Tipe file tidak didukung. Harap unggah gambar (PNG, JPG, WebP, SVG) atau audio (MP3).' }, 400);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return json({ success: false, message: 'Ukuran file terlalu besar (maksimal 5MB).' }, 400);
  }

  const dot = lowerName.lastIndexOf('.');
  const ext = dot > 0 ? lowerName.substring(dot).replace(/[^a-z0-9.]/g, '') : '';
  const cleanName = (dot > 0 ? name.substring(0, dot) : name).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanName}_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;

  await getStore('uploads').set(filename, file, {
    metadata: { contentType: file.type || 'application/octet-stream' }
  });

  return json({
    success: true,
    file_url: `/uploads/${filename}`,
    filename,
    mimetype: file.type,
    size: file.size
  });
}, true);

export default async (req: Request) => {
  const url = new URL(req.url);
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const params = matchRoute(r.segments, url.pathname);
    if (!params) continue;

    try {
      if (r.admin && !(await db.verifySession(getSessionToken(req)))) {
        return json({ success: false, message: 'Sesi admin telah berakhir. Silakan masuk kembali.' }, 401);
      }
      return await r.handler(req, params);
    } catch (err) {
      console.error(`API error on ${req.method} ${url.pathname}:`, err);
      return json({ success: false, message: 'Terjadi kesalahan pada server. Silakan coba lagi.' }, 500);
    }
  }
  return json({ success: false, message: 'Endpoint tidak ditemukan.' }, 404);
};

export const config: Config = {
  path: '/api/*'
};
