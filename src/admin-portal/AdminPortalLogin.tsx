import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  HelpCircle,
  X,
  Info,
} from 'lucide-react';
import { adminLogin, VALID_CREDENTIAL_HINTS } from '../services/auth';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface AdminPortalLoginProps {
  onLoginSuccess: () => void;
}

export const AdminPortalLogin: React.FC<AdminPortalLoginProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState('egutudanny6@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrUsername.trim()) {
      setErrorMessage('Please enter your administrator username or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setLoading(true);

    try {
      const result = await adminLogin(emailOrUsername, password, rememberMe);

      if (result.success) {
        showToast(`Welcome to HavenStay Management Portal, ${result.user?.name || 'Administrator'}!`, 'success');
        onLoginSuccess();
      } else {
        setErrorMessage(
          result.message ||
            'Invalid credentials. Please verify your administrator username and password.'
        );
        showToast('Authentication failed', 'error');
      }
    } catch {
      setErrorMessage('A server connection error occurred during login. Please try again.');
      showToast('Login error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#121615] text-[#F7F5F0] font-sans selection:bg-[#D5AD72] selection:text-[#121615] relative overflow-hidden">
      {/* Background Architectural Grid & Subtle Radial Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#D5AD72]/20 via-[#142D26]/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D5AD72]/10 blur-3xl" />
      </div>

      {/* Top Subtle Status Bar */}
      <div className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="font-mono uppercase tracking-wider text-[11px] text-white/70">
            Secure Management Environment · SSL Encrypted
          </span>
        </div>
        <span className="font-mono text-[11px] hidden sm:inline text-white/40">
          manage.havenstayhotels.com
        </span>
      </div>

      {/* Main Centered Login Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#181D1C] border border-[#D5AD72]/30 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          {/* Top Gold Trim Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#D5AD72] via-[#F3E5C8] to-[#B88E52]" />

          <div className="p-8 sm:p-10 space-y-6">
            {/* Header Branding */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#1E2523] to-[#121615] border border-[#D5AD72]/40 text-[#D5AD72] flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-2 pt-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]/60" />
                <span
                  className="text-xs uppercase tracking-[0.25em] font-semibold text-[#D5AD72]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  HavenStay Hotels
                </span>
                <span className="h-[1px] w-6 bg-[#D5AD72]/60" />
              </div>

              <h1
                className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Management Portal
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Authorized hotel executive and operations console.
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="alert"
                className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-red-100">Access Restricted</span>
                  <span>{errorMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Administrator Email / Username */}
              <div>
                <label
                  htmlFor="portal-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#D5AD72] mb-1.5"
                >
                  Administrator Email / Username
                </label>
                <div className="relative">
                  <input
                    id="portal-email"
                    type="text"
                    autoComplete="username"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="egutudanny6@gmail.com"
                    className="w-full h-12 pl-10 pr-4 bg-[#121615] border border-[#D5AD72]/30 rounded-xl text-sm text-white font-medium placeholder:text-white/30 focus:border-[#D5AD72] focus:outline-none focus:ring-1 focus:ring-[#D5AD72] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#D5AD72] absolute left-3.5 top-4" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="portal-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#D5AD72]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] text-[#D5AD72]/80 hover:text-[#D5AD72] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter management password"
                    className="w-full h-12 pl-10 pr-12 bg-[#121615] border border-[#D5AD72]/30 rounded-xl text-sm text-white font-medium placeholder:text-white/30 focus:border-[#D5AD72] focus:outline-none focus:ring-1 focus:ring-[#D5AD72] transition-colors"
                  />
                  <Lock className="w-4 h-4 text-[#D5AD72] absolute left-3.5 top-4" />

                  {/* Show/Hide Password Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 p-1 text-white/50 hover:text-[#D5AD72] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-white/70 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D5AD72]/50 bg-[#121615] text-[#D5AD72] focus:ring-[#D5AD72]"
                  />
                  <span>Keep session active</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowCredentialsHint(!showCredentialsHint)}
                  className="text-[11px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#D5AD72]/70" />
                  <span>Credential Guide</span>
                </button>
              </div>

              {/* Quick Credential Hint Box (Click to toggle) */}
              {showCredentialsHint && (
                <div className="p-3 rounded-lg bg-black/40 border border-[#D5AD72]/30 text-xs text-white/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#D5AD72] font-semibold text-[11px] uppercase">
                    <Info className="w-3.5 h-3.5" />
                    <span>Authorized Manager Credentials</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-white/40 block">Email:</span>
                      <span className="text-[#D5AD72]">egutudanny6@gmail.com</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Password:</span>
                      <span className="text-white font-bold">HavenStay2026!</span>
                      <span className="text-white/40 block text-[10px]">or: admin1234</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailOrUsername('egutudanny6@gmail.com');
                      setPassword('HavenStay2026!');
                    }}
                    className="mt-1 text-[11px] text-[#D5AD72] underline cursor-pointer"
                  >
                    Auto-fill authorized credentials
                  </button>
                </div>
              )}

              {/* Sign In Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  fullWidth
                  size="lg"
                  loading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-xl min-h-[48px] font-bold text-sm tracking-wider uppercase text-[#121615]"
                >
                  Sign In to Management Portal
                </Button>
              </div>
            </form>
          </div>

          {/* Security Footer Notice */}
          <div className="bg-[#121615] px-6 py-3.5 border-t border-white/5 text-center text-[11px] text-white/40 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-[#D5AD72]/60" />
            <span>Strictly Confidential · HavenStay Hotels Hospitality Management</span>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotPasswordModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#181D1C] border border-[#D5AD72]/40 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#D5AD72]" />
                  <h3 className="font-serif font-bold text-white text-base">Password Recovery</h3>
                </div>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-white/70 space-y-3">
                <p>
                  Administrator password resets are managed securely via hotel IT operations for <strong className="text-white">HavenStay Hotels Nigeria</strong>.
                </p>
                <div className="p-3 rounded-lg bg-[#121615] border border-[#D5AD72]/30 space-y-1 text-xs">
                  <span className="text-[#D5AD72] font-semibold block">Registered Administrator:</span>
                  <p className="text-white font-mono">egutudanny6@gmail.com</p>
                  <span className="text-white/40 block text-[11px] pt-1">
                    Direct IT Emergency line: +234 907 577 2701
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Default root recovery key: <code className="text-[#D5AD72]">HavenStay2026!</code>
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  fullWidth
                  onClick={() => {
                    setPassword('HavenStay2026!');
                    setShowForgotPasswordModal(false);
                    showToast('Administrator password filled from secure recovery key', 'info');
                  }}
                >
                  Use Administrator Recovery Key
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Legal Notice */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-white/30 border-t border-white/5">
        © {new Date().getFullYear()} HavenStay Hotels Hospitality Group. All internal rights reserved.
      </footer>
    </div>
  );
};
