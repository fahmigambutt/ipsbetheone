import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginPageProps {
  onLoginSuccess: (mustChangePassword: boolean) => void;
  onBackToPublic: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToPublic
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [focusedInput, setFocusedInput] = useState<'username' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success) {
        if (data.token) {
          localStorage.setItem('xii_admin_token', data.token);
        }
        onLoginSuccess(data.must_change_password);
      } else {
        setErrorMsg(data.message || 'Username atau password salah.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute w-[500px] h-[500px] bg-[#E50914]/15 rounded-full blur-[140px] pointer-events-none"
      />

      {/* Main Login Card with Smooth Slide & Fade Up */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-black/60 border border-white/20 rounded-3xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] space-y-6 backdrop-blur-2xl z-10"
      >
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E50914] text-white flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(229,9,20,0.6)] border border-red-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-mono tracking-widest text-white uppercase">
            PANEL ADMINISTRATOR
          </h1>
          <p className="text-xs text-gray-300 font-mono">
            XII SOCIAL MAN 3 BANJAR
          </p>
        </motion.div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs font-mono text-center backdrop-blur-md"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Form with Interactive Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          {/* Username Input with Scale-Up Focus Effect */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-1"
          >
            <label className="text-gray-300 tracking-wider block">USERNAME</label>
            <motion.div
              animate={{
                scale: focusedInput === 'username' ? 1.025 : 1,
                borderColor: focusedInput === 'username' ? '#E50914' : 'rgba(255,255,255,0.15)'
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative rounded-2xl border bg-white/5 backdrop-blur-md focus-within:shadow-[0_0_20px_rgba(229,9,20,0.35)] transition-shadow overflow-hidden"
            >
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Masukkan username"
                required
                className="w-full bg-transparent pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none"
              />
            </motion.div>
          </motion.div>

          {/* Password Input with Scale-Up Focus Effect */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="space-y-1"
          >
            <label className="text-gray-300 tracking-wider block">PASSWORD</label>
            <motion.div
              animate={{
                scale: focusedInput === 'password' ? 1.025 : 1,
                borderColor: focusedInput === 'password' ? '#E50914' : 'rgba(255,255,255,0.15)'
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative rounded-2xl border bg-white/5 backdrop-blur-md focus-within:shadow-[0_0_20px_rgba(229,9,20,0.35)] transition-shadow overflow-hidden"
            >
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Masukkan password"
                required
                className="w-full bg-transparent pl-10 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#E50914]/90 hover:bg-[#E50914] text-white font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_25px_rgba(229,9,20,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-red-500/30"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'VERIFIKASI...' : 'MASUK KE PANEL'}</span>
            </motion.button>
          </motion.div>

        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-white/10 text-center"
        >
          <button
            onClick={onBackToPublic}
            className="text-xs font-mono text-gray-300 hover:text-[#E50914] transition-colors"
          >
            ← Kembali ke Website Publik
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

