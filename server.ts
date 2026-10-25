import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';

const app = express();
const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'xii_social_man3banjar_secret_key';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser(SESSION_SECRET));

// Static files for uploaded assets
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
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
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.glb') || file.originalname.endsWith('.gltf')) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Harap unggah gambar (PNG, JPG, WebP, SVG) atau audio (MP3).'));
    }
  }
});

// Admin Session Helper
const sessionStore = new Set<string>();

// Rate limiter store for admin login
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}
const loginRateLimits = new Map<string, RateLimitRecord>();
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function createSessionToken(): string {
  const token = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
  sessionStore.add(token);
  return token;
}

function verifySessionToken(token: string | undefined): boolean {
  return !!token && sessionStore.has(token);
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = req.signedCookies?.xii_session || req.cookies?.xii_session || req.headers['x-admin-token'] || bearerToken;
  if (!verifySessionToken(token as string)) {
    return res.status(401).json({ success: false, message: 'Sesi admin telah berakhir. Silakan masuk kembali.' });
  }
  next();
}

// ------------------- AUTH ENDPOINTS -------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rateLimit = loginRateLimits.get(clientIp);

  if (rateLimit && rateLimit.blockedUntil > now) {
    const remainingMinutes = Math.ceil((rateLimit.blockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login yang gagal. Akses diblokir sementara. Coba lagi dalam ${remainingMinutes} menit.`
    });
  }

  const auth = db.getAdminAuth();
  if (username !== auth.username || !db.verifyAdminPassword(password)) {
    const currentRecord = rateLimit || { attempts: 0, blockedUntil: 0 };
    currentRecord.attempts += 1;
    if (currentRecord.attempts >= MAX_LOGIN_ATTEMPTS) {
      currentRecord.blockedUntil = now + BLOCK_DURATION_MS;
      currentRecord.attempts = 0;
    }
    loginRateLimits.set(clientIp, currentRecord);

    const remainingAttempts = MAX_LOGIN_ATTEMPTS - currentRecord.attempts;
    return res.status(401).json({
      success: false,
      message: remainingAttempts > 0
        ? `Username atau password salah. Sisa percobaan: ${remainingAttempts}.`
        : 'Terlalu banyak percobaan gagal. Akun diblokir sementara selama 15 menit.'
    });
  }

  // Clear rate limit record on successful login
  loginRateLimits.delete(clientIp);

  const token = createSessionToken();
  res.cookie('xii_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  return res.json({
    success: true,
    message: 'Login berhasil.',
    must_change_password: auth.must_change_password,
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.signedCookies?.xii_session || req.cookies?.xii_session || req.headers['x-admin-token'];
  if (typeof token === 'string') {
    sessionStore.delete(token);
  }
  res.clearCookie('xii_session');
  return res.json({ success: true, message: 'Berhasil keluar.' });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = req.signedCookies?.xii_session || req.cookies?.xii_session || req.headers['x-admin-token'] || bearerToken;
  const isValid = verifySessionToken(token as string);
  const auth = db.getAdminAuth();
  return res.json({
    authenticated: isValid,
    must_change_password: auth.must_change_password,
    username: auth.username
  });
});

app.post('/api/auth/change-password', requireAdmin, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
  }

  if (!db.verifyAdminPassword(current_password)) {
    return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
  }

  db.updateAdminPassword(new_password);
  return res.json({ success: true, message: 'Password berhasil diperbarui.' });
});

// ------------------- PUBLIC ENDPOINTS -------------------
app.get('/api/public/all', (_req, res) => {
  const store = db.getStore();
  
  if (store.site_settings.maintenance_settings.enabled) {
    return res.json({
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
  const ngl_messages = db.getNGLMessages(false);

  return res.json({
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
app.get('/api/ngl-messages', (_req, res) => {
  return res.json({ success: true, data: db.getNGLMessages(false) });
});

app.post('/api/ngl-messages', (req, res) => {
  const { recipient_id, recipient_name, message, sticker_tag } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Pesan rahasia tidak boleh kosong.' });
  }
  if (message.trim().length > 350) {
    return res.status(400).json({ success: false, message: 'Pesan terlalu panjang (maksimal 350 karakter).' });
  }

  const newMsg = db.createNGLMessage({
    recipient_id,
    recipient_name,
    message,
    sticker_tag
  });

  return res.json({ success: true, data: newMsg });
});

app.post('/api/ngl-messages/:id/like', (req, res) => {
  const updated = db.likeNGLMessage(req.params.id);
  if (!updated) return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan.' });
  return res.json({ success: true, data: updated });
});


// ------------------- ADMIN ENDPOINTS -------------------
app.get('/api/admin/all', requireAdmin, (_req, res) => {
  const store = db.getStore();
  return res.json({
    site_settings: store.site_settings,
    teachers: store.teachers,
    members: store.members,
    roles: store.roles,
    albums: store.albums,
    gallery_items: store.gallery_items,
    backgrounds: store.backgrounds,
    scene_settings: store.scene_settings,
    activity_logs: store.activity_logs,
    ngl_messages: db.getNGLMessages(true)
  });
});

app.post('/api/admin/ngl-messages/:id/reply', requireAdmin, (req, res) => {
  const { reply } = req.body;
  if (!reply || typeof reply !== 'string') {
    return res.status(400).json({ success: false, message: 'Balasan tidak boleh kosong.' });
  }
  const updated = db.replyNGLMessage(req.params.id, reply);
  if (!updated) return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan.' });
  return res.json({ success: true, data: updated });
});

app.patch('/api/admin/ngl-messages/:id/toggle', requireAdmin, (req, res) => {
  const updated = db.toggleNGLMessage(req.params.id);
  if (!updated) return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan.' });
  return res.json({ success: true, data: updated });
});

app.delete('/api/admin/ngl-messages/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteNGLMessage(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan atau sudah dihapus.' });
  }
  return res.json({ success: true, message: 'Pesan rahasia berhasil dihapus.' });
});


app.put('/api/admin/site-settings', requireAdmin, (req, res) => {
  const updated = db.updateSiteSettings(req.body);
  return res.json({ success: true, data: updated });
});

app.put('/api/admin/teachers', requireAdmin, (req, res) => {
  const updated = db.updateTeachers(req.body);
  return res.json({ success: true, data: updated });
});

app.post('/api/admin/members', requireAdmin, (req, res) => {
  const newMember = db.createMember(req.body);
  return res.json({ success: true, data: newMember });
});

app.put('/api/admin/members/:id', requireAdmin, (req, res) => {
  const updated = db.updateMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
  return res.json({ success: true, data: updated });
});

app.delete('/api/admin/members/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteMember(req.params.id);
  return res.json({ success: deleted });
});

app.post('/api/admin/members/reorder', requireAdmin, (req, res) => {
  const { member_ids } = req.body;
  if (!Array.isArray(member_ids)) return res.status(400).json({ success: false, message: 'Daftar ID tidak valid.' });
  const reordered = db.reorderMembers(member_ids);
  return res.json({ success: true, data: reordered });
});

app.post('/api/admin/members/import', requireAdmin, (req, res) => {
  const { members } = req.body;
  if (!Array.isArray(members)) return res.status(400).json({ success: false, message: 'Format data import tidak valid.' });
  
  let count = 0;
  members.forEach(m => {
    if (m.full_name) {
      db.createMember({
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
        display_order: db.getMembers().length + 1,
        is_visible: true
      });
      count++;
    }
  });

  return res.json({ success: true, count, message: `${count} anggota berhasil diimpor.` });
});

app.put('/api/admin/roles', requireAdmin, (req, res) => {
  const updated = db.updateRoles(req.body);
  return res.json({ success: true, data: updated });
});

app.post('/api/admin/albums', requireAdmin, (req, res) => {
  const newAlbum = db.createAlbum(req.body);
  return res.json({ success: true, data: newAlbum });
});

app.put('/api/admin/albums/:id', requireAdmin, (req, res) => {
  const updated = db.updateAlbum(req.params.id, req.body);
  return res.json({ success: true, data: updated });
});

app.delete('/api/admin/albums/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteAlbum(req.params.id);
  return res.json({ success: deleted });
});

app.post('/api/admin/gallery', requireAdmin, (req, res) => {
  const newItem = db.createGalleryItem(req.body);
  return res.json({ success: true, data: newItem });
});

app.put('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  const updated = db.updateGalleryItem(req.params.id, req.body);
  return res.json({ success: true, data: updated });
});

app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteGalleryItem(req.params.id);
  return res.json({ success: deleted });
});

app.put('/api/admin/backgrounds/:id', requireAdmin, (req, res) => {
  const updated = db.updateBackground(req.params.id, req.body);
  return res.json({ success: true, data: updated });
});

app.put('/api/admin/scene-settings/:sectionKey', requireAdmin, (req, res) => {
  const updated = db.updateSceneSetting(req.params.sectionKey, req.body);
  return res.json({ success: true, data: updated });
});

app.get('/api/admin/activity-logs', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: db.getActivityLogs() });
});

app.get('/api/admin/backup', requireAdmin, (_req, res) => {
  const backup = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=XII_SOCIAL_BACKUP_${Date.now()}.json`);
  return res.send(JSON.stringify(backup, null, 2));
});

app.post('/api/admin/backup/restore', requireAdmin, (req, res) => {
  try {
    db.importBackup(req.body);
    return res.json({ success: true, message: 'Data berhasil dipulihkan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Gagal memulihkan backup.' });
  }
});

// Upload endpoint
app.post('/api/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    file_url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server XII SOCIAL running at http://localhost:${PORT}`);
    });
  }
}

export default app;

startServer();
