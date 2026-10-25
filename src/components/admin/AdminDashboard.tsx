import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Image as ImageIcon,
  Sliders,
  Music,
  Download,
  Upload,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  Search,
  MessageSquare,
  Eye,
  EyeOff,
  Heart
} from 'lucide-react';
import {
  SiteSettings,
  Teacher,
  ClassMember,
  OrganizationRole,
  Album,
  GalleryItem,
  SectionBackground,
  SceneSettings,
  NGLMessage
} from '../../types';

interface AdminDashboardProps {
  mustChangePasswordInitial: boolean;
  onLogout: () => void;
  onRefreshPublicData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  mustChangePasswordInitial,
  onLogout,
  onRefreshPublicData
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'identity' | 'structure' | 'members' | 'gallery' | 'backgrounds' | 'audio' | 'ngl' | 'backup' | 'password'
  >(mustChangePasswordInitial ? 'password' : 'overview');


  const [mustChangePassword, setMustChangePassword] = useState(mustChangePasswordInitial);

  // Loaded admin state
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<SectionBackground[]>([]);
  const [sceneSettings, setSceneSettings] = useState<SceneSettings[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [nglMessages, setNglMessages] = useState<NGLMessage[]>([]);
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});

  const [isLoading, setIsLoading] = useState(true);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter state for members
  const [memberSearch, setMemberSearch] = useState('');

  // Form Modals state
  const [memberModal, setMemberModal] = useState<Partial<ClassMember> | null>(null);
  const [teacherModal, setTeacherModal] = useState<Partial<Teacher> | null>(null);
  const [roleModal, setRoleModal] = useState<Partial<OrganizationRole> | null>(null);
  const [albumModal, setAlbumModal] = useState<Partial<Album> | null>(null);
  const [galleryModal, setGalleryModal] = useState<Partial<GalleryItem> | null>(null);

  // Password change form
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Helper for authenticated admin requests
  const adminFetch = (url: string, init?: RequestInit) => {
    const token = localStorage.getItem('xii_admin_token');
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('x-admin-token', token);
    }
    return fetch(url, { ...init, headers });
  };

  // Fetch full admin data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/all');
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      setSiteSettings(data.site_settings);
      setTeachers(data.teachers || []);
      setMembers(data.members || []);
      setRoles(data.roles || []);
      setAlbums(data.albums || []);
      setGalleryItems(data.gallery_items || []);
      setBackgrounds(data.backgrounds || []);
      setSceneSettings(data.scene_settings || []);
      setActivityLogs(data.activity_logs || []);
      setNglMessages(data.ngl_messages || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // NGL Admin Handlers
  const handleReplyNGL = async (id: string) => {
    const text = replyInput[id];
    if (!text || !text.trim()) return;
    const res = await adminFetch(`/api/admin/ngl-messages/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text.trim() })
    });
    if (res.ok) {
      showStatus('Balasan pesan anonim berhasil disimpan.');
      setReplyInput(prev => ({ ...prev, [id]: '' }));
      loadAdminData();
      onRefreshPublicData();
    }
  };

  const handleToggleNGL = async (id: string) => {
    const res = await adminFetch(`/api/admin/ngl-messages/${id}/toggle`, { method: 'PATCH' });
    if (res.ok) {
      showStatus('Status visibilitas pesan diperbarui.');
      loadAdminData();
      onRefreshPublicData();
    }
  };

  const handleDeleteNGL = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pesan anonim ini?')) return;
    try {
      const res = await adminFetch(`/api/admin/ngl-messages/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showStatus('Pesan anonim berhasil dihapus.');
        setNglMessages(prev => prev.filter(m => String(m.id).trim() !== String(id).trim()));
        onRefreshPublicData();
      } else {
        showStatus(data.message || 'Gagal menghapus pesan.', 'error');
      }
    } catch (err) {
      console.error('Failed to delete NGL message:', err);
      showStatus('Gagal menghapus pesan rahasia.', 'error');
    }
  };


  // ---------------- API ACTIONS ----------------
  const handleSaveSiteSettings = async () => {
    if (!siteSettings) return;
    const res = await adminFetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteSettings)
    });
    const data = await res.json();
    if (data.success) {
      showStatus('Pengaturan identitas website berhasil disimpan.');
      onRefreshPublicData();
    }
  };

  // MEMBERS API
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberModal) return;

    if (memberModal.id) {
      const res = await adminFetch(`/api/admin/members/${memberModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberModal)
      });
      if (res.ok) {
        showStatus('Data anggota berhasil diperbarui.');
        loadAdminData();
        onRefreshPublicData();
        setMemberModal(null);
      }
    } else {
      const res = await adminFetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memberModal,
          display_order: members.length + 1,
          is_visible: true
        })
      });
      if (res.ok) {
        showStatus('Anggota baru berhasil ditambahkan.');
        loadAdminData();
        onRefreshPublicData();
        setMemberModal(null);
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    const res = await adminFetch(`/api/admin/members/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showStatus('Anggota berhasil dihapus.');
      loadAdminData();
      onRefreshPublicData();
    }
  };

  // TEACHERS API
  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherModal) return;

    let updatedTeachers = [...teachers];
    if (teacherModal.id) {
      updatedTeachers = updatedTeachers.map(t => (t.id === teacherModal.id ? ({ ...t, ...teacherModal } as Teacher) : t));
    } else {
      const newTeacher: Teacher = {
        id: `teacher_${Date.now()}`,
        full_name: teacherModal.full_name || 'Nama Guru',
        title: teacherModal.title || 'Wali Kelas',
        photo_url: teacherModal.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
        description: teacherModal.description || '',
        is_visible: true
      };
      updatedTeachers.push(newTeacher);
    }

    const res = await adminFetch('/api/admin/teachers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTeachers)
    });

    if (res.ok) {
      showStatus('Data Wali Kelas/Guru diperbarui.');
      loadAdminData();
      onRefreshPublicData();
      setTeacherModal(null);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data wali kelas/guru ini?')) return;
    const updatedTeachers = teachers.filter(t => t.id !== id);
    const res = await adminFetch('/api/admin/teachers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTeachers)
    });
    if (res.ok) {
      showStatus('Data guru dihapus.');
      loadAdminData();
      onRefreshPublicData();
    }
  };

  // ROLES API
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModal) return;

    let updatedRoles = [...roles];
    if (roleModal.id) {
      updatedRoles = updatedRoles.map(r => (r.id === roleModal.id ? ({ ...r, ...roleModal } as OrganizationRole) : r));
    } else {
      const newRole: OrganizationRole = {
        id: `role_${Date.now()}`,
        role_name: roleModal.role_name || 'Jabatan Baru',
        role_group: roleModal.role_group || 'INTI',
        description: roleModal.description || '',
        display_order: roles.length + 1,
        is_visible: true
      };
      updatedRoles.push(newRole);
    }

    const res = await adminFetch('/api/admin/roles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRoles)
    });

    if (res.ok) {
      showStatus('Struktur organisasi diperbarui.');
      loadAdminData();
      onRefreshPublicData();
      setRoleModal(null);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Yakin ingin menghapus struktur ini?')) return;
    const updatedRoles = roles.filter(r => r.id !== id);
    const res = await adminFetch('/api/admin/roles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRoles)
    });
    if (res.ok) {
      showStatus('Struktur dihapus.');
      loadAdminData();
      onRefreshPublicData();
    }
  };

  // ALBUMS API
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumModal) return;

    if (albumModal.id) {
      const res = await adminFetch(`/api/admin/albums/${albumModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumModal)
      });
      if (res.ok) {
        showStatus('Album kenangan diperbarui.');
        loadAdminData();
        onRefreshPublicData();
        setAlbumModal(null);
      }
    } else {
      const res = await adminFetch('/api/admin/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...albumModal,
          display_order: albums.length + 1,
          is_visible: true
        })
      });
      if (res.ok) {
        showStatus('Album baru dibuat.');
        loadAdminData();
        onRefreshPublicData();
        setAlbumModal(null);
      }
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Yakin ingin menghapus album ini? Foto di dalamnya tidak akan terhapus.')) return;
    const res = await adminFetch(`/api/admin/albums/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showStatus('Album dihapus.');
      loadAdminData();
      onRefreshPublicData();
    }
  };

  // GALLERY API
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryModal) return;

    if (galleryModal.id) {
      const res = await adminFetch(`/api/admin/gallery/${galleryModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryModal)
      });
      if (res.ok) {
        showStatus('Foto kenangan diperbarui.');
        loadAdminData();
        onRefreshPublicData();
        setGalleryModal(null);
      }
    } else {
      const res = await adminFetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...galleryModal,
          display_order: galleryItems.length + 1,
          is_visible: true
        })
      });
      if (res.ok) {
        showStatus('Foto kenangan diunggah.');
        loadAdminData();
        onRefreshPublicData();
        setGalleryModal(null);
      }
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;
    const res = await adminFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showStatus('Foto dihapus.');
      loadAdminData();
      onRefreshPublicData();
    }
  };

  // BACKGROUND API
  const handleSaveBackground = async (bg: SectionBackground) => {
    const res = await adminFetch(`/api/admin/backgrounds/${bg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bg)
    });
    if (res.ok) {
      showStatus(`Background ${bg.section_key} diperbarui.`);
      loadAdminData();
      onRefreshPublicData();
    }
  };

  // FILE UPLOAD HELPER
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await adminFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        callback(data.file_url);
        showStatus('File berhasil diunggah!');
      } else {
        showStatus(data.message || 'Gagal mengunggah file.', 'error');
      }
    } catch (err) {
      showStatus('Gagal mengunggah file.', 'error');
    }
  };

  // PASSWORD CHANGE
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currPassword, new_password: newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showStatus('Password berhasil diubah. Akun Anda kini aman.');
      setMustChangePassword(false);
      setCurrPassword('');
      setNewPassword('');
    } else {
      showStatus(data.message || 'Gagal mengubah password.', 'error');
    }
  };

  // BACKUP RESTORE FILE UPLOAD
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await adminFetch('/api/admin/backup/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        const data = await res.json();
        if (data.success) {
          showStatus('Pemulihan backup berhasil! Data website dipulihkan.');
          loadAdminData();
          onRefreshPublicData();
        } else {
          showStatus(data.message || 'Gagal memulihkan backup.', 'error');
        }
      } catch (err) {
        showStatus('Format file backup JSON tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filtered members for display
  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.nickname.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (isLoading || !siteSettings) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#E50914] flex items-center justify-center font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#E50914]" />
        <span>MEMUAT PANEL ADMINISTRATOR...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-black/40 border-r border-white/10 p-4 flex flex-col justify-between flex-shrink-0 font-mono text-xs backdrop-blur-2xl">
        <div className="space-y-6">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            {siteSettings?.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt="Logo Kelas"
                className="w-8 h-8 rounded-xl object-cover border border-red-400/30 shadow-[0_0_15px_rgba(229,9,20,0.5)] bg-black/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#E50914] text-white font-black flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)] border border-red-400/30">
                XII
              </div>
            )}
            <div>
              <span className="font-bold text-white block truncate max-w-[130px]">{siteSettings?.class_name || 'PANEL PENGELOLA'}</span>
              <span className="text-[10px] text-gray-300 block">{siteSettings?.school_name || 'MAN 3 BANJAR'}</span>
            </div>
          </div>

          {mustChangePassword && (
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-600/80 text-amber-200 text-[11px] space-y-1 backdrop-blur-md">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>PERINGATAN KEAMANAN</span>
              </div>
              <p className="font-sans">Anda wajib mengganti password awal sebelum dapat menggunakan fitur lain.</p>
            </div>
          )}

          {/* Menu Items */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
              { id: 'identity', label: 'Identitas & Teks', icon: FileText },
              { id: 'structure', label: 'Guru & Struktur', icon: Users },
              { id: 'members', label: `Anggota Kelas (${members.length})`, icon: Users },
              { id: 'gallery', label: 'Galeri & Album', icon: ImageIcon },
              { id: 'backgrounds', label: 'Latar Belakang', icon: Sliders },
              { id: 'audio', label: 'Musik Latar', icon: Music },
              { id: 'ngl', label: `Pesan Rahasia NGL (${nglMessages.length})`, icon: MessageSquare },
              { id: 'backup', label: 'Backup & Restore', icon: Download },
              { id: 'password', label: 'Keamanan Akun', icon: KeyRound }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={mustChangePassword && item.id !== 'password'}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all backdrop-blur-md ${
                    isActive
                      ? 'bg-[#E50914] text-white font-bold shadow-[0_0_18px_rgba(229,9,20,0.5)] border border-red-400/40'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent disabled:opacity-30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-[#E50914] text-white transition-all font-bold border border-white/10 backdrop-blur-md"
          >
            <LogOut className="w-4 h-4" />
            <span>KELUAR PENGELOLA</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl">
        
        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border text-xs font-mono shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-black/80 border-[#E50914] text-white'
                : 'bg-red-950/90 border-red-700 text-red-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-[#E50914]" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold font-mono text-white">RINGKASAN ARSIP DIGITAL</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#B3B3B3]">TOTAL ANGGOTA</span>
                <span className="text-3xl font-black text-[#E50914] block">{members.length}</span>
              </div>
              <div className="p-5 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#B3B3B3]">PENGURUS KELAS</span>
                <span className="text-3xl font-black text-[#E50914] block">
                  {members.filter(m => m.is_officer).length}
                </span>
              </div>
              <div className="p-5 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#B3B3B3]">FOTO KENANGAN</span>
                <span className="text-3xl font-black text-[#E50914] block">{galleryItems.length}</span>
              </div>
              <div className="p-5 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#B3B3B3]">ALBUM AKTIF</span>
                <span className="text-3xl font-black text-[#E50914] block">{albums.length}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-4">
              <h2 className="text-sm font-mono text-[#E50914] tracking-widest uppercase font-bold">TINDAKAN CEPAT EDITING</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setActiveTab('members'); setMemberModal({}); }}
                  className="px-4 py-2.5 rounded-xl bg-[#E50914] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota</span>
                </button>
                <button
                  onClick={() => { setActiveTab('gallery'); setGalleryModal({}); }}
                  className="px-4 py-2.5 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white font-mono text-xs flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Unggah Foto Kenangan</span>
                </button>
                <button
                  onClick={() => setActiveTab('backgrounds')}
                  className="px-4 py-2.5 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white font-mono text-xs flex items-center gap-2 transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Atur Background Section</span>
                </button>
                <button
                  onClick={() => setActiveTab('identity')}
                  className="px-4 py-2.5 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white font-mono text-xs flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Edit Teks Website</span>
                </button>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="p-6 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-4 font-mono text-xs">
              <h2 className="text-sm text-[#E50914] font-bold tracking-widest uppercase">RIWAYAT PERUBAHAN DATA</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded bg-[#141414] border border-[#2B2B2B] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-[10px] text-[#B3B3B3] block">{log.metadata || log.entity_type}</span>
                    </div>
                    <span className="text-[10px] text-[#B3B3B3]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. IDENTITY TAB */}
        {activeTab === 'identity' && (
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-bold font-mono text-white">EDIT IDENTITAS & LOGO WEBSITE</h1>

            {/* LOGO EDIT CARD */}
            <div className="p-6 bg-black/40 border border-white/15 rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-mono text-white font-bold uppercase">LOGO & IKON KELAS</h2>
                  <p className="text-xs text-gray-300 font-mono">Ubah gambar logo yang tampil di bilah navigasi dan panel pengelola</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="relative group flex-shrink-0">
                  {siteSettings.logo_url ? (
                    <img
                      src={siteSettings.logo_url}
                      alt="Logo Preview"
                      className="w-20 h-20 rounded-2xl object-cover border border-white/20 shadow-[0_0_20px_rgba(229,9,20,0.5)] bg-black/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#E50914] text-white font-mono font-black text-2xl tracking-widest shadow-[0_0_25px_rgba(229,9,20,0.6)] flex items-center justify-center border border-red-400/30">
                      XII
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2 font-mono text-xs">
                  <label className="text-gray-300 block">URL GAMBAR LOGO (ATAU UNGGAH DARI PERANGKAT)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={siteSettings.logo_url || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, logo_url: e.target.value })}
                      placeholder="Masukkan URL foto atau klik tombol unggah..."
                      className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-[#E50914]/90 hover:bg-[#E50914] text-white cursor-pointer flex items-center gap-1.5 font-bold transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)] border border-red-500/30">
                      <Upload className="w-4 h-4" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setSiteSettings({ ...siteSettings, logo_url: url }))}
                      />
                    </label>
                  </div>
                  {siteSettings.logo_url && (
                    <button
                      type="button"
                      onClick={() => setSiteSettings({ ...siteSettings, logo_url: '' })}
                      className="text-[11px] text-red-400 hover:underline inline-block pt-1"
                    >
                      Hapus Logo Custom (Kembalikan ke Badge Default "XII")
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSiteSettings}
                className="w-full py-3 rounded-2xl bg-[#E50914]/90 hover:bg-[#E50914] text-white font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2 border border-red-500/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Logo Kelas</span>
              </button>
            </div>

            {/* IDENTITY TEXT CARD */}
            <div className="space-y-4 font-mono text-xs bg-black/40 p-6 rounded-3xl border border-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <div>
                <label className="text-gray-300 block mb-1">NAMA KELAS</label>
                <input
                  type="text"
                  value={siteSettings.class_name}
                  onChange={(e) => setSiteSettings({ ...siteSettings, class_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">NAMA SEKOLAH</label>
                <input
                  type="text"
                  value={siteSettings.school_name}
                  onChange={(e) => setSiteSettings({ ...siteSettings, school_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">TAHUN ANGKATAN</label>
                <input
                  type="text"
                  value={siteSettings.class_year}
                  onChange={(e) => setSiteSettings({ ...siteSettings, class_year: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">TAGLINE UTAMA</label>
                <input
                  type="text"
                  value={siteSettings.tagline || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                  placeholder="ONE CLASS. ONE STORY. ONE FOREVER."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white font-bold focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              {/* HERO BANNER IMAGE */}
              <div>
                <label className="text-gray-300 block mb-1">FOTO HERO UTAMA (BANNER KELAS)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.hero_image_url || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_image_url: e.target.value })}
                    placeholder="URL foto hero utama..."
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center gap-1.5 font-bold transition-all border border-white/15">
                    <Upload className="w-4 h-4 text-[#E50914]" />
                    <span>Unggah</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setSiteSettings({ ...siteSettings, hero_image_url: url }))}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1">JUDUL UTAMA PEMBUKAAN (HERO)</label>
                <input
                  type="text"
                  value={siteSettings.opening_title}
                  onChange={(e) => setSiteSettings({ ...siteSettings, opening_title: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white font-bold focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">DESKRIPSI PEMBUKAAN</label>
                <textarea
                  rows={3}
                  value={siteSettings.opening_description}
                  onChange={(e) => setSiteSettings({ ...siteSettings, opening_description: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">JUDUL PENUTUP (EPILOG)</label>
                <input
                  type="text"
                  value={siteSettings.closing_title}
                  onChange={(e) => setSiteSettings({ ...siteSettings, closing_title: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white font-bold focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">DESKRIPSI PENUTUP</label>
                <textarea
                  rows={3}
                  value={siteSettings.closing_description}
                  onChange={(e) => setSiteSettings({ ...siteSettings, closing_description: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>

              {/* MAINTENANCE & PUBLICATION SETTINGS */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="font-bold text-white block">MODE PEMELIHARAAN (MAINTENANCE)</span>
                    <span className="text-[11px] text-gray-400 block">Kunci website dari publik selama proses pembaruan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSiteSettings({
                      ...siteSettings,
                      maintenance_settings: {
                        ...siteSettings.maintenance_settings,
                        enabled: !siteSettings.maintenance_settings.enabled
                      }
                    })}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                      siteSettings.maintenance_settings?.enabled
                        ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                        : 'bg-white/10 text-gray-400 border border-white/10'
                    }`}
                  >
                    {siteSettings.maintenance_settings?.enabled ? 'AKTIF (TERKUNCI)' : 'NONAKTIF (PUBLIK)'}
                  </button>
                </div>

                {siteSettings.maintenance_settings?.enabled && (
                  <div>
                    <label className="text-gray-300 block mb-1">PESAN PEMELIHARAAN UNTUK PENGUNJUNG</label>
                    <input
                      type="text"
                      value={siteSettings.maintenance_settings.message || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        maintenance_settings: {
                          ...siteSettings.maintenance_settings,
                          message: e.target.value
                        }
                      })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-[#E50914] outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveSiteSettings}
                className="px-6 py-3 bg-[#E50914] hover:bg-[#F40612] text-white font-bold rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all cursor-pointer border border-red-500/30"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Teks</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. STRUCTURE TAB (WALI KELAS & JABATAN) */}
        {activeTab === 'structure' && (
          <div className="space-y-8">
            
            {/* WALI KELAS & GURU */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold font-mono text-white">EDIT WALI KELAS & GURU</h1>
                  <p className="text-xs text-[#B3B3B3] font-mono">Kelola pahlawan tanpa tanda jasa penuntun XII Social</p>
                </div>
                <button
                  onClick={() => setTeacherModal({})}
                  className="px-4 py-2 rounded-xl bg-[#E50914] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Guru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map((t) => (
                  <div key={t.id} className="p-4 bg-[#181818] border border-[#2B2B2B] rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={t.photo_url} alt={t.full_name} className="w-14 h-14 rounded-xl object-cover border border-[#2B2B2B]" />
                      <div>
                        <span className="font-bold text-sm text-white block">{t.full_name}</span>
                        <span className="text-xs text-[#E50914] font-mono font-bold block">{t.title}</span>
                        {t.description && <p className="text-[11px] text-[#B3B3B3] line-clamp-1 mt-0.5">{t.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setTeacherModal(t)}
                        className="p-2 rounded-lg bg-[#262626] hover:bg-[#E50914] text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(t.id)}
                        className="p-2 rounded-lg bg-[#262626] hover:bg-red-800 text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STRUKTUR ORGANISASI */}
            <div className="space-y-4 pt-6 border-t border-[#2B2B2B]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-mono text-white">EDIT STRUKTUR ORGANISASI KELAS</h2>
                  <p className="text-xs text-[#B3B3B3] font-mono">Kelola posisi jabatan pengurus (Ketua, Wakil, Sekretaris, Bendahara, dll)</p>
                </div>
                <button
                  onClick={() => setRoleModal({})}
                  className="px-4 py-2 rounded-xl bg-[#E50914] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jabatan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {roles.map((r) => (
                  <div key={r.id} className="p-4 bg-[#181818] border border-[#2B2B2B] rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#E50914] font-bold block uppercase">{r.role_name}</span>
                      <span className="font-bold text-xs text-[#B3B3B3] block">{r.role_group}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setRoleModal(r)}
                        className="p-1.5 rounded-lg bg-[#262626] hover:bg-[#E50914] text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(r.id)}
                        className="p-1.5 rounded-lg bg-[#262626] hover:bg-red-800 text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 4. MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-mono text-white">DATA ANGGOTA KELAS ({members.length})</h1>
                <p className="text-xs text-[#B3B3B3] font-mono">Edit nama, foto, slogan, kesan pesan, dan jabatan siswa</p>
              </div>
              <button
                onClick={() => setMemberModal({})}
                className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,9,20,0.4)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Anggota Baru</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Cari nama anggota atau julukan..."
                className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#B3B3B3]/40 outline-none font-mono"
              />
            </div>

            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMembers.map((m) => (
                <div key={m.id} className="p-4 bg-[#181818] border border-[#2B2B2B] hover:border-[#E50914]/60 rounded-2xl flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={m.photo_url} alt={m.full_name} className="w-12 h-12 rounded-xl object-cover border border-[#2B2B2B]" />
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs text-white block truncate">{m.full_name}</span>
                      <span className="text-[10px] text-[#E50914] font-mono font-bold block truncate">
                        "{m.nickname}" {m.is_officer && `• ${m.officer_role}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setMemberModal(m)}
                      className="p-2 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white transition-colors"
                      title="Edit Anggota"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-2 rounded-xl bg-[#262626] hover:bg-red-800 text-white transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. GALLERY & ALBUMS TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            
            {/* ALBUMS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold font-mono text-white">ALBUM KENANGAN ({albums.length})</h1>
                  <p className="text-xs text-[#B3B3B3] font-mono">Kategori album tempat foto-foto diorganisir</p>
                </div>
                <button
                  onClick={() => setAlbumModal({})}
                  className="px-4 py-2 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Tambah Album</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {albums.map((alb) => (
                  <div key={alb.id} className="p-4 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-2">
                    <span className="font-bold text-xs text-white block">{alb.title}</span>
                    <p className="text-[11px] text-[#B3B3B3] line-clamp-1">{alb.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#2B2B2B]">
                      <button onClick={() => setAlbumModal(alb)} className="text-xs font-mono text-[#E50914] font-bold">Edit</button>
                      <button onClick={() => handleDeleteAlbum(alb.id)} className="text-xs font-mono text-red-400">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GALLERY ITEMS SECTION */}
            <div className="space-y-4 pt-6 border-t border-[#2B2B2B]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-mono text-white">FOTO KENANGAN ({galleryItems.length})</h2>
                  <p className="text-xs text-[#B3B3B3] font-mono">Unggah dan kelola koleksi foto momen indah</p>
                </div>
                <button
                  onClick={() => setGalleryModal({})}
                  className="px-4 py-2 rounded-xl bg-[#E50914] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Unggah Foto Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryItems.map((g) => (
                  <div key={g.id} className="p-3 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-2">
                    <img src={g.file_url} alt={g.title} className="w-full aspect-[4/3] object-cover rounded-xl border border-[#2B2B2B]" />
                    <span className="font-bold text-xs text-white block truncate">{g.title}</span>
                    <div className="flex items-center justify-between pt-2 border-t border-[#2B2B2B]">
                      <button
                        onClick={() => setGalleryModal(g)}
                        className="text-xs font-mono text-[#E50914] font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Foto
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryItem(g.id)}
                        className="text-xs font-mono text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 6. BACKGROUNDS TAB */}
        {activeTab === 'backgrounds' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-mono text-white">EDIT BACKGROUND BAGIAN (SECTIONS)</h1>
              <p className="text-xs text-[#B3B3B3] font-mono">Ubah gambar latar belakang atmosferik untuk setiap bagian website</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              {backgrounds.map((bg) => (
                <div key={bg.id} className="p-5 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-sm">{bg.section_key}</span>
                    <span className="text-[10px] text-[#E50914] bg-[#141414] px-2 py-0.5 rounded border border-[#E50914]/40 font-bold">
                      {bg.section_key}
                    </span>
                  </div>

                  {/* Preview Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2B2B2B] bg-black">
                    <img src={bg.file_url} alt={bg.section_key} className="w-full h-full object-cover" />
                  </div>

                  {/* Input & Upload */}
                  <div className="space-y-2">
                    <label className="text-[#B3B3B3] block text-[10px]">URL GAMBAR LATAR</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bg.file_url}
                        onChange={(e) => {
                          const updated = backgrounds.map(b => (b.id === bg.id ? { ...b, file_url: e.target.value } : b));
                          setBackgrounds(updated);
                        }}
                        className="flex-1 bg-[#141414] border border-[#2B2B2B] rounded-xl px-3 py-2 text-white outline-none focus:border-[#E50914]"
                      />
                      <label className="px-3 py-2 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white cursor-pointer flex items-center gap-1 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => {
                            const updated = backgrounds.map(b => (b.id === bg.id ? { ...b, file_url: url } : b));
                            setBackgrounds(updated);
                          })}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveBackground(bg)}
                    className="w-full py-2.5 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Background</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="space-y-6 max-w-xl font-mono text-xs">
            <h1 className="text-2xl font-bold text-white">EDIT MUSIK LATAR & SOUNDTRACK</h1>

            <div className="p-6 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-4">
              <div>
                <label className="text-[#B3B3B3] block mb-1">URL FILE AUDIO / SOUNDTRACK (MP3)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.audio_settings?.audio_url || ''}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      audio_settings: {
                        ...(siteSettings.audio_settings || { enabled: true, title: 'Background Audio', volume: 0.5, loop: true, sfx_enabled: true }),
                        audio_url: e.target.value
                      }
                    })}
                    className="flex-1 bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 text-white outline-none focus:border-[#E50914]"
                  />
                  <label className="px-4 py-3 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setSiteSettings({
                        ...siteSettings,
                        audio_settings: {
                          ...(siteSettings.audio_settings || { enabled: true, title: 'Background Audio', volume: 0.5, loop: true, sfx_enabled: true }),
                          audio_url: url
                        }
                      }))}
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveSiteSettings}
                className="w-full py-3 bg-[#E50914] hover:bg-[#F40612] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.4)] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Musik</span>
              </button>
            </div>
          </div>
        )}

        {/* 8. NGL / PESAN RAHASIA TAB */}
        {activeTab === 'ngl' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white uppercase">MODERASI PESAN RAHASIA (NGL)</h1>
                <p className="text-[#B3B3B3]">Kelola, balas, atau sembunyikan pesan anonim yang masuk dari pengunjung.</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-xs font-bold w-fit">
                TOTAL: {nglMessages.length} PESAN
              </div>
            </div>

            {nglMessages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#181818] border border-[#2B2B2B] text-gray-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-500" />
                <p>Belum ada pesan anonim yang masuk.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nglMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      m.is_visible
                        ? 'bg-[#181818] border-[#2B2B2B]'
                        : 'bg-red-950/20 border-red-900/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E50914] text-white">
                          {m.sticker_tag || 'Confession'}
                        </span>
                        <span className="text-gray-300">
                          Untuk: <strong className="text-white">{m.recipient_name || 'Seluruh XII Social'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-[10px]">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                          {m.likes_count}
                        </span>
                        <span>{new Date(m.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <p className="text-sm text-white font-sans font-medium bg-black/40 p-3 rounded-xl border border-white/10">
                      "{m.message}"
                    </p>

                    {m.reply && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                        <span className="font-bold block text-emerald-400">BALASAN ADMIN:</span>
                        <p className="font-sans">"{m.reply}"</p>
                      </div>
                    )}

                    {/* Reply Input Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis balasan resmi kelas/admin..."
                        value={replyInput[m.id] || ''}
                        onChange={(e) => setReplyInput({ ...replyInput, [m.id]: e.target.value })}
                        className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-[#E50914] outline-none"
                      />
                      <button
                        onClick={() => handleReplyNGL(m.id)}
                        className="px-4 py-2 bg-[#E50914] hover:bg-[#F40612] text-white font-bold rounded-xl shadow-[0_0_12px_rgba(229,9,20,0.4)]"
                      >
                        Kirim Balasan
                      </button>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <button
                        onClick={() => handleToggleNGL(m.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
                          m.is_visible
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {m.is_visible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tampil Publik (Klik utk Sembunyikan)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Disembunyikan (Klik utk Tampilkan)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteNGL(m.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Pesan</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. BACKUP TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 max-w-xl font-mono text-xs">
            <h1 className="text-2xl font-bold text-white">BACKUP & PEMULIHAN DATABASE</h1>

            <div className="p-6 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-6">
              <div className="space-y-2">
                <span className="font-bold text-white block">1. UNDUH BACKUP</span>
                <p className="text-[#B3B3B3]">Ekspor seluruh data XII Social ke dalam file JSON untuk cadangan aman.</p>
                <a
                  href="/api/admin/backup"
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] text-white font-bold shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Backup JSON</span>
                </a>
              </div>

              <div className="space-y-2 pt-6 border-t border-[#2B2B2B]">
                <span className="font-bold text-white block">2. RESTORE BACKUP</span>
                <p className="text-[#B3B3B3]">Pulihkan data dari file JSON cadangan sebelumnya.</p>
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#262626] hover:bg-[#E50914] text-white font-bold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Backup JSON</span>
                  <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 9. PASSWORD CHANGE TAB */}
        {activeTab === 'password' && (
          <div className="space-y-6 max-w-md font-mono text-xs">
            <h1 className="text-2xl font-bold text-white">GANTI PASSWORD AKUN ADMIN</h1>

            <form onSubmit={handleChangePassword} className="p-6 bg-[#181818] border border-[#2B2B2B] rounded-2xl space-y-4">
              <div>
                <label className="text-[#B3B3B3] block mb-1">PASSWORD SAAT INI</label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  required
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 text-white focus:border-[#E50914] outline-none"
                />
              </div>

              <div>
                <label className="text-[#B3B3B3] block mb-1">PASSWORD BARU (MINIMAL 6 KARAKTER)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl p-3 text-white focus:border-[#E50914] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E50914] hover:bg-[#F40612] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all cursor-pointer"
              >
                Simpan Password Baru
              </button>
            </form>
          </div>
        )}

      </main>

      {/* MEMBER EDIT MODAL */}
      {memberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <form
            onSubmit={handleSaveMember}
            className="w-full max-w-lg bg-black/75 border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs text-white max-h-[90vh] overflow-y-auto shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <h3 className="text-sm font-bold text-[#E50914] tracking-wider uppercase border-b border-white/10 pb-3">
              {memberModal.id ? 'EDIT ANGGOTA KELAS' : 'TAMBAH ANGGOTA KELAS BARU'}
            </h3>

            <div>
              <label className="text-gray-300 block mb-1">NAMA LENGKAP</label>
              <input
                type="text"
                value={memberModal.full_name || ''}
                onChange={(e) => setMemberModal({ ...memberModal, full_name: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">NAMA PANGGILAN (NICKNAME)</label>
              <input
                type="text"
                value={memberModal.nickname || ''}
                onChange={(e) => setMemberModal({ ...memberModal, nickname: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">FOTO ANGGOTA (URL ATAU UNGGAH)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={memberModal.photo_url || ''}
                  onChange={(e) => setMemberModal({ ...memberModal, photo_url: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
                <label className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-[#E50914] border border-white/15 text-white cursor-pointer flex items-center transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => setMemberModal({ ...memberModal, photo_url: url }))}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="is_officer_chk"
                checked={!!memberModal.is_officer}
                onChange={(e) => setMemberModal({ ...memberModal, is_officer: e.target.checked })}
                className="w-4 h-4 accent-[#E50914]"
              />
              <label htmlFor="is_officer_chk" className="text-white cursor-pointer">Pengurus / Jabatan Khusus</label>
            </div>

            {memberModal.is_officer && (
              <div>
                <label className="text-gray-300 block mb-1">NAMA JABATAN (Cth: Ketua Kelas, Bendahara)</label>
                <input
                  type="text"
                  value={memberModal.officer_role || ''}
                  onChange={(e) => setMemberModal({ ...memberModal, officer_role: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
              </div>
            )}

            <div>
              <label className="text-gray-300 block mb-1">MOTTO HIDUP / SLOGAN</label>
              <input
                type="text"
                value={memberModal.motto || ''}
                onChange={(e) => setMemberModal({ ...memberModal, motto: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">KESAN & PESAN KENANGAN</label>
              <textarea
                rows={2}
                value={memberModal.memory_message || ''}
                onChange={(e) => setMemberModal({ ...memberModal, memory_message: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">AKUN INSTAGRAM / SOSIAL MEDIA</label>
              <input
                type="text"
                value={memberModal.social_url || ''}
                onChange={(e) => setMemberModal({ ...memberModal, social_url: e.target.value })}
                placeholder="@username atau URL"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMemberModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
              >
                Simpan Anggota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEACHER EDIT MODAL */}
      {teacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <form
            onSubmit={handleSaveTeacher}
            className="w-full max-w-lg bg-black/75 border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs text-white shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <h3 className="text-sm font-bold text-[#E50914] tracking-wider uppercase border-b border-white/10 pb-3">
              {teacherModal.id ? 'EDIT DATA GURU / WALI KELAS' : 'TAMBAH GURU BARU'}
            </h3>

            <div>
              <label className="text-gray-300 block mb-1">NAMA GURU / WALI KELAS</label>
              <input
                type="text"
                value={teacherModal.full_name || ''}
                onChange={(e) => setTeacherModal({ ...teacherModal, full_name: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">PERAN / JABATAN GURU</label>
              <input
                type="text"
                value={teacherModal.title || ''}
                onChange={(e) => setTeacherModal({ ...teacherModal, title: e.target.value })}
                required
                placeholder="Cth: Wali Kelas XII Social"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">FOTO GURU (URL ATAU UNGGAH)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teacherModal.photo_url || ''}
                  onChange={(e) => setTeacherModal({ ...teacherModal, photo_url: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
                <label className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-[#E50914] border border-white/15 text-white cursor-pointer flex items-center transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => setTeacherModal({ ...teacherModal, photo_url: url }))}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-gray-300 block mb-1">PESAN / WEJANGAN GURU</label>
              <textarea
                rows={3}
                value={teacherModal.description || ''}
                onChange={(e) => setTeacherModal({ ...teacherModal, description: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setTeacherModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ROLE EDIT MODAL */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <form
            onSubmit={handleSaveRole}
            className="w-full max-w-lg bg-black/75 border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs text-white shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <h3 className="text-sm font-bold text-[#E50914] tracking-wider uppercase border-b border-white/10 pb-3">
              {roleModal.id ? 'EDIT JABATAN / STRUKTUR' : 'TAMBAH JABATAN BARU'}
            </h3>

            <div>
              <label className="text-gray-300 block mb-1">NAMA JABATAN</label>
              <input
                type="text"
                value={roleModal.role_name || ''}
                onChange={(e) => setRoleModal({ ...roleModal, role_name: e.target.value })}
                required
                placeholder="Cth: Ketua Kelas, Wakil Ketua, dll"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">KELOMPOK JABATAN</label>
              <select
                value={roleModal.role_group || 'INTI'}
                onChange={(e) => setRoleModal({ ...roleModal, role_group: e.target.value as any })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              >
                <option value="WALI_KELAS" className="bg-neutral-900 text-white">WALI KELAS</option>
                <option value="INTI" className="bg-neutral-900 text-white">PENGURUS INTI</option>
                <option value="SEKSI" className="bg-neutral-900 text-white">SEKSI BIDANG</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRoleModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALBUM EDIT MODAL */}
      {albumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <form
            onSubmit={handleSaveAlbum}
            className="w-full max-w-lg bg-black/75 border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs text-white shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <h3 className="text-sm font-bold text-[#E50914] tracking-wider uppercase border-b border-white/10 pb-3">
              {albumModal.id ? 'EDIT ALBUM' : 'TAMBAH ALBUM KENANGAN BARU'}
            </h3>

            <div>
              <label className="text-gray-300 block mb-1">NAMA ALBUM</label>
              <input
                type="text"
                value={albumModal.title || ''}
                onChange={(e) => setAlbumModal({ ...albumModal, title: e.target.value })}
                required
                placeholder="Cth: Study Tour, Classmeeting"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">DESKRIPSI ALBUM</label>
              <textarea
                rows={2}
                value={albumModal.description || ''}
                onChange={(e) => setAlbumModal({ ...albumModal, description: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAlbumModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
              >
                Simpan Album
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GALLERY EDIT MODAL */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <form
            onSubmit={handleSaveGalleryItem}
            className="w-full max-w-lg bg-black/75 border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs text-white max-h-[90vh] overflow-y-auto shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <h3 className="text-sm font-bold text-[#E50914] tracking-wider uppercase border-b border-white/10 pb-3">
              {galleryModal.id ? 'EDIT FOTO KENANGAN' : 'UNGGAH FOTO KENANGAN BARU'}
            </h3>

            <div>
              <label className="text-gray-300 block mb-1">JUDUL FOTO</label>
              <input
                type="text"
                value={galleryModal.title || ''}
                onChange={(e) => setGalleryModal({ ...galleryModal, title: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">FILE FOTO (URL ATAU UNGGAH)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={galleryModal.file_url || ''}
                  onChange={(e) => setGalleryModal({ ...galleryModal, file_url: e.target.value })}
                  required
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
                />
                <label className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-[#E50914] border border-white/15 text-white cursor-pointer flex items-center transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => setGalleryModal({ ...galleryModal, file_url: url }))}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-gray-300 block mb-1">KATEGORI ALBUM</label>
              <select
                value={galleryModal.album_id || albums[0]?.id || ''}
                onChange={(e) => setGalleryModal({ ...galleryModal, album_id: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id} className="bg-neutral-900 text-white">
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 block mb-1">DESKRIPSI FOTO</label>
              <textarea
                rows={2}
                value={galleryModal.description || ''}
                onChange={(e) => setGalleryModal({ ...galleryModal, description: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">TANGGAL FOTO</label>
              <input
                type="text"
                value={galleryModal.photo_date || ''}
                onChange={(e) => setGalleryModal({ ...galleryModal, photo_date: e.target.value })}
                placeholder="Cth: 15 Mei 2025"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">LOKASI</label>
              <input
                type="text"
                value={galleryModal.location || ''}
                onChange={(e) => setGalleryModal({ ...galleryModal, location: e.target.value })}
                placeholder="Cth: MAN 3 Banjar"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:border-[#E50914] outline-none backdrop-blur-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setGalleryModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
              >
                Simpan Foto
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
