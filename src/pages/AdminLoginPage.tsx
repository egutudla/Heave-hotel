import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { adminLogin, isAdminAuthenticated } from '../services/auth';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const { showToast } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrUsername.trim()) {
      setErrorMessage('Please enter your administrator username or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await adminLogin(emailOrUsername, password, rememberMe);

      if (result.success) {
        showToast(`Welcome back, ${result.user?.name || 'Administrator'}!`, 'success');
        onLoginSuccess();
      } else {
        setErrorMessage(
          result.message ||
            'Invalid credentials. Please verify your administrator username and password.'
        );
        showToast('Authentication failed', 'error');
      }
    } catch (err: any) {
      setErrorMessage('A network error occurred during login. Please try again.');
      showToast('Login error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F7F5F0]">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D5AD72]/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#142D26]/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_rgba(20,45,38,0.12)] border border-[#D5AD72]/40 overflow-hidden z-10"
      >
        {/* Top Gold Trim */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#142D26] via-[#D5AD72] to-[#142D26]" />

        <div className="p-8 sm:p-10 space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#142D26] text-[#D5AD72] flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-2 pt-1">
              <span className="h-[1px] w-6 bg-[#D5AD72]" />
              <span
                className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B88E52]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                HavenStay Hotels
              </span>
              <span className="h-[1px] w-6 bg-[#D5AD72]" />
            </div>

            <h1
              className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Administrator Login
            </h1>
            <p className="text-xs sm:text-sm text-[#575757]">
              Authorized hotel personnel and reservations management access.
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Notice</span>
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
              >
                Administrator Username or Email
              </label>
              <div className="relative">
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@havenstay.com"
                  className="w-full h-12 pl-10 pr-4 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-xl text-sm text-[#242424] font-medium placeholder:text-[#575757]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#B88E52] absolute left-3.5 top-4" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full h-12 pl-10 pr-12 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-xl text-sm text-[#242424] font-medium placeholder:text-[#575757]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#B88E52] absolute left-3.5 top-4" />

                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 p-1 text-[#575757] hover:text-[#142D26] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#575757] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D5AD72] text-[#142D26] focus:ring-[#D5AD72]"
                />
                <span>Remember this terminal session</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                fullWidth
                size="lg"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
                className="shadow-md min-h-[48px]"
              >
                Sign In to Admin Dashboard
              </Button>
            </div>
          </form>

          {/* Return to Public Website */}
          <div className="pt-4 border-t border-[#F7F5F0] text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs text-[#575757] hover:text-[#142D26] transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public HavenStay Website</span>
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="bg-[#142D26] px-6 py-3 text-center text-[11px] text-white/60">
          <span>Protected Hotel Operations · HavenStay Hotels Nigeria</span>
        </div>
      </motion.div>
    </div>
  );
};
