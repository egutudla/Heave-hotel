import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  KeyRound,
  LogOut,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Plus,
  RefreshCw,
  Printer,
  Bed,
  CreditCard,
  DollarSign,
  TrendingUp,
  Sliders,
  Check,
  ChevronDown,
  Trash2,
  X,
  Building,
} from 'lucide-react';
import { BookingRecord, Room } from '../types';
import {
  getStoredBookings,
  saveStoredBooking,
  updateStoredBookingStatus,
  deleteStoredBooking,
  getStoredContacts,
  deleteStoredContact,
  StoredContact,
  APPS_SCRIPT_URL,
  MOCK_ROOMS,
} from '../config/api';
import { formatNaira, CURRENCY_SYMBOL } from '../utils/currency';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('havenstay_admin_auth') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'rooms' | 'inquiries' | 'sync'>('bookings');

  // Bookings Data
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Inquiries Data
  const [contacts, setContacts] = useState<StoredContact[]>([]);

  // Room Inventory Rates State
  const [roomsList, setRoomsList] = useState<Room[]>(() => {
    const saved = localStorage.getItem('havenstay_custom_rooms');
    return saved ? JSON.parse(saved) : MOCK_ROOMS;
  });
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);

  // Modals
  const [activeReceiptModal, setActiveReceiptModal] = useState<BookingRecord | null>(null);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Manual Walk-in Booking Form State
  const [manualForm, setManualForm] = useState({
    roomId: 'ROOM-101',
    fullName: '',
    phone: '',
    email: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })(),
    adults: 2,
    children: 0,
    requests: '',
    paymentPref: 'Pay at hotel' as const,
  });

  // Google Sheets Ping State
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Load Data on Mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBookings(getStoredBookings());
    setContacts(getStoredContacts());
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    // Default passkey is 1234 or manager password
    if (passkeyInput === '1234' || passkeyInput.toLowerCase() === 'havenstay' || passkeyInput === '2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('havenstay_admin_auth', 'true');
      showToast('Welcome to HavenStay Manager Portal', 'success');
    } else {
      setAuthError('Invalid management passkey. Hint: default passkey is 1234');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('havenstay_admin_auth');
    setPasskeyInput('');
    showToast('Logged out of admin dashboard', 'info');
  };

  // Status Update Handler
  const handleStatusChange = (ref: string, newStatus: BookingRecord['status']) => {
    const updated = updateStoredBookingStatus(ref, newStatus);
    setBookings(updated);
    showToast(`Reservation ${ref} marked as ${newStatus}`, 'success');
  };

  // Delete Handler
  const handleDeleteBooking = (ref: string) => {
    if (window.confirm(`Are you sure you want to remove reservation ${ref}?`)) {
      const updated = deleteStoredBooking(ref);
      setBookings(updated);
      showToast(`Reservation ${ref} removed`, 'info');
    }
  };

  // Delete Contact Handler
  const handleDeleteContact = (id: string) => {
    const updated = deleteStoredContact(id);
    setContacts(updated);
    showToast('Inquiry removed', 'info');
  };

  // Manual Booking Submission
  const handleManualBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ci = new Date(manualForm.checkIn);
    const co = new Date(manualForm.checkOut);
    const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
    const room = roomsList.find((r) => r.RoomID === manualForm.roomId) || roomsList[0];
    const total = nights * room.PricePerNight;
    const ref = 'HS-WLK' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const record: BookingRecord = {
      ...manualForm,
      id: ref,
      bookingRef: ref,
      roomName: room.Name,
      pricePerNight: room.PricePerNight,
      nights,
      total,
      status: 'Confirmed',
      consent: true,
      createdAt: new Date().toISOString(),
    };

    saveStoredBooking(record);
    refreshData();
    setIsManualBookingOpen(false);
    showToast(`Walk-in reservation ${ref} created successfully!`, 'success');

    // Reset form
    setManualForm({
      roomId: 'ROOM-101',
      fullName: '',
      phone: '',
      email: '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
      })(),
      adults: 2,
      children: 0,
      requests: '',
      paymentPref: 'Pay at hotel',
    });
  };

  // Room Rate Update
  const handleSaveRoomRate = (roomId: string) => {
    if (editPriceInput <= 0) return;
    const updated = roomsList.map((r) =>
      r.RoomID === roomId ? { ...r, PricePerNight: editPriceInput } : r
    );
    setRoomsList(updated);
    localStorage.setItem('havenstay_custom_rooms', JSON.stringify(updated));
    setEditingRoomId(null);
    showToast('Room rate updated in Nigerian Naira', 'success');
  };

  // Google Sheets Ping Test
  const handlePingGoogleSheets = async () => {
    setPingLoading(true);
    setPingResult(null);
    const startTime = Date.now();
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=rooms`);
      const elapsed = Date.now() - startTime;
      if (res.ok) {
        setPingResult({
          ok: true,
          message: `Connected successfully! Response latency: ${elapsed}ms`,
        });
        showToast('Google Apps Script responded successfully', 'success');
      } else {
        setPingResult({
          ok: false,
          message: `Endpoint returned HTTP ${res.status}: ${res.statusText}`,
        });
        showToast('Endpoint error', 'error');
      }
    } catch (err: any) {
      setPingResult({
        ok: false,
        message: `Failed to reach Google Apps Script: ${err.message || 'Network error'}`,
      });
      showToast('Connection test failed', 'error');
    } finally {
      setPingLoading(false);
    }
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('No bookings available to export', 'error');
      return;
    }
    const headers = [
      'Booking Ref',
      'Created At',
      'Guest Name',
      'Email',
      'Phone',
      'Room ID',
      'Room Name',
      'Check In',
      'Check Out',
      'Nights',
      'Adults',
      'Children',
      'Nightly Rate (NGN)',
      'Total Amount (NGN)',
      'Payment Preference',
      'Special Requests',
      'Status',
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingRef}"`,
      `"${new Date(b.createdAt).toLocaleString()}"`,
      `"${b.fullName}"`,
      `"${b.email}"`,
      `"${b.phone}"`,
      `"${b.roomId}"`,
      `"${b.roomName}"`,
      `"${b.checkIn}"`,
      `"${b.checkOut}"`,
      b.nights,
      b.adults,
      b.children || 0,
      b.pricePerNight,
      b.total,
      `"${b.paymentPref}"`,
      `"${(b.requests || '').replace(/"/g, '""')}"`,
      `"${b.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HavenStay_Reservations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reservations CSV downloaded successfully', 'success');
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (selectedStatusFilter !== 'All' && b.status !== selectedStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = b.bookingRef?.toLowerCase().includes(q);
        const matchesName = b.fullName?.toLowerCase().includes(q);
        const matchesPhone = b.phone?.toLowerCase().includes(q);
        const matchesEmail = b.email?.toLowerCase().includes(q);
        const matchesRoom = b.roomName?.toLowerCase().includes(q);
        return matchesRef || matchesName || matchesPhone || matchesEmail || matchesRoom;
      }
      return true;
    });
  }, [bookings, selectedStatusFilter, searchQuery]);

  // Performance KPI Metrics
  const metrics = useMemo(() => {
    const totalCount = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Checked-In').length;
    const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
    const totalRevenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const occupancyRate = Math.min(100, Math.round((confirmedCount / Math.max(1, roomsList.length * 3)) * 100));

    return {
      totalCount,
      confirmedCount,
      pendingCount,
      totalRevenue,
      occupancyRate,
    };
  }, [bookings, roomsList]);

  // WhatsApp Message Generator
  const getWhatsAppMessage = (b: BookingRecord) => {
    const text = `Hello ${b.fullName},\n\nThis is HavenStay Hotels regarding your reservation (${b.bookingRef}) for the ${b.roomName}.\n\nDates: ${b.checkIn} to ${b.checkOut} (${b.nights} nights)\nTotal: ${formatNaira(b.total)}\nStatus: ${b.status}\n\nWe look forward to welcoming you to HavenStay! Please feel free to reply with any arrival details or questions.`;
    const cleanPhone = b.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // If not logged in, show elegant login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-[#0D1F1A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)] border border-[#D5AD72]/40"
        >
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 mx-auto rounded-xl bg-[#142D26] text-[#D5AD72] flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-2 pt-2">
              <span className="h-[1px] w-5 bg-[#D5AD72]" />
              <span className="text-[11px] font-serif uppercase tracking-[0.2em] font-semibold text-[#B88E52]">
                Staff & Concierge
              </span>
              <span className="h-[1px] w-5 bg-[#D5AD72]" />
            </div>
            <h1
              className="text-2xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Management Portal
            </h1>
            <p className="text-xs text-[#575757]">
              Enter your executive access passkey to manage HavenStay reservations and rates.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-passkey"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
              >
                Access Passkey / PIN
              </label>
              <div className="relative">
                <input
                  id="admin-passkey"
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter manager passkey (Default: 1234)"
                  className="w-full h-12 pl-10 pr-4 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-xl text-sm text-[#142D26] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-[#B88E52] absolute left-3.5 top-4" />
              </div>
              {authError && <p className="text-xs text-red-600 mt-1.5 font-medium">{authError}</p>}
            </div>

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              className="shadow-md min-h-[48px]"
            >
              Unlock Dashboard
            </Button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs text-[#575757] hover:text-[#142D26] transition-colors cursor-pointer"
              >
                ← Return to Guest Website
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#F7F5F0] text-[#242424]">
      {/* Top Admin Header Bar */}
      <div className="bg-[#142D26] text-white border-b border-[#D5AD72]/30 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-[#D5AD72]/20 text-[#D5AD72] text-[11px] font-semibold tracking-wider uppercase">
                Hotel Operations
              </span>
              <span className="text-xs text-white/60">HavenStay Hotels Nigeria</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Executive Management Dashboard
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsManualBookingOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#D5AD72] text-[#142D26] text-xs font-semibold hover:bg-[#e0bb82] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Walk-In Guest</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer"
              title="Download Excel / CSV spreadsheet"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={refreshData}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs font-medium border border-red-400/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Metrics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#575757]">
              <span>Total Bookings</span>
              <Calendar className="w-4 h-4 text-[#B88E52]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]">
              {metrics.totalCount}
            </div>
            <div className="text-[11px] text-[#575757]">
              <span>{metrics.confirmedCount} confirmed · {metrics.pendingCount} pending</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#575757]">
              <span>Total Revenue (NGN)</span>
              <TrendingUp className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]">
              {formatNaira(metrics.totalRevenue)}
            </div>
            <div className="text-[11px] text-[#25D366] font-medium">
              <span>All active bookings</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#575757]">
              <span>Pending Reviews</span>
              <Clock className="w-4 h-4 text-[#D5AD72]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#B88E52]">
              {metrics.pendingCount}
            </div>
            <div className="text-[11px] text-[#575757]">
              <span>Require staff verification</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#575757]">
              <span>Room Catalog</span>
              <Bed className="w-4 h-4 text-[#142D26]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]">
              {roomsList.length} Suites
            </div>
            <div className="text-[11px] text-[#575757]">
              <span>Nightly pricing in ₦ Naira</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#D5AD72]/30 overflow-x-auto pb-px scrollbar-none">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-[#142D26] text-[#142D26] bg-white rounded-t-lg'
                : 'border-transparent text-[#575757] hover:text-[#142D26]'
            }`}
          >
            <span>Reservations Master ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'border-[#142D26] text-[#142D26] bg-white rounded-t-lg'
                : 'border-transparent text-[#575757] hover:text-[#142D26]'
            }`}
          >
            <span>Room Inventory & Rates ({roomsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-[#142D26] text-[#142D26] bg-white rounded-t-lg'
                : 'border-transparent text-[#575757] hover:text-[#142D26]'
            }`}
          >
            <span>Guest Inquiries ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-[#142D26] text-[#142D26] bg-white rounded-t-lg'
                : 'border-transparent text-[#575757] hover:text-[#142D26]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-[#107c41]" />
              <span>Google Sheets Sync</span>
            </span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS MASTER */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#D5AD72]/30 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#575757] absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guest, phone (+234...), ref, or room..."
                  className="w-full h-10 pl-9 pr-4 bg-[#F7F5F0] border border-[#D5AD72]/30 rounded-lg text-xs sm:text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D5AD72]"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', 'Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                      selectedStatusFilter === status
                        ? 'bg-[#142D26] text-white shadow-xs'
                        : 'bg-[#F7F5F0] text-[#575757] hover:bg-black/5'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List / Cards */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#D5AD72]/30 p-8 space-y-3">
                <Calendar className="w-10 h-10 text-[#D5AD72] mx-auto" />
                <h3 className="text-lg font-serif font-bold text-[#142D26]">No reservations found</h3>
                <p className="text-xs text-[#575757] max-w-sm mx-auto">
                  {searchQuery || selectedStatusFilter !== 'All'
                    ? 'No bookings match your current filter or search criteria.'
                    : 'No bookings recorded yet. New website reservations will appear here immediately.'}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setIsManualBookingOpen(true)}>
                  Create Walk-In Reservation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => {
                  const statusColors = {
                    Pending: 'bg-amber-100 text-amber-900 border-amber-300',
                    Confirmed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                    'Checked-In': 'bg-blue-100 text-blue-900 border-blue-300',
                    Completed: 'bg-purple-100 text-purple-900 border-purple-300',
                    Cancelled: 'bg-rose-100 text-rose-900 border-rose-300',
                  };

                  return (
                    <motion.div
                      key={b.id || b.bookingRef}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-[#D5AD72]/35 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Info: Ref, Guest, Room */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-[#142D26] bg-[#F7F5F0] px-2.5 py-1 rounded border border-[#D5AD72]/40">
                              {b.bookingRef}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                statusColors[b.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {b.status}
                            </span>
                            <span className="text-xs text-[#575757]">
                              Booked on {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="pt-1">
                            <h3 className="text-lg font-serif font-bold text-[#142D26]">
                              {b.fullName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#575757] mt-0.5">
                              <span className="flex items-center gap-1 text-[#142D26] font-medium">
                                <Bed className="w-3.5 h-3.5 text-[#B88E52]" />
                                {b.roomName}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#B88E52]" />
                                {b.checkIn} to {b.checkOut} ({b.nights} {b.nights === 1 ? 'night' : 'nights'})
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#B88E52]" />
                                {b.adults} Adults{b.children ? `, ${b.children} Children` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            <a
                              href={`tel:${b.phone}`}
                              className="inline-flex items-center gap-1 text-[#142D26] font-medium hover:text-[#B88E52]"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#B88E52]" />
                              <span>{b.phone}</span>
                            </a>
                            <span className="text-[#D5AD72]">·</span>
                            <a
                              href={`mailto:${b.email}`}
                              className="inline-flex items-center gap-1 text-[#142D26] font-medium hover:text-[#B88E52]"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#B88E52]" />
                              <span>{b.email}</span>
                            </a>
                          </div>

                          {b.requests && (
                            <p className="text-xs text-[#575757] italic bg-[#F7F5F0] p-2 rounded-lg border border-[#D5AD72]/20 mt-2">
                              Special Request: "{b.requests}"
                            </p>
                          )}
                        </div>

                        {/* Right: Pricing, Status Changer & Quick Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F7F5F0]">
                          <div className="text-left sm:text-right">
                            <span className="text-xs text-[#575757] block">Total Amount</span>
                            <span
                              className="text-xl sm:text-2xl font-serif font-bold text-[#142D26]"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                              {formatNaira(b.total)}
                            </span>
                            <span className="text-[11px] text-[#B88E52] block font-medium">
                              {b.paymentPref}
                            </span>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* WhatsApp Quick Chat */}
                            <a
                              href={getWhatsAppMessage(b)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-colors shadow-xs"
                              title="Chat Guest on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {/* View Receipt */}
                            <button
                              onClick={() => setActiveReceiptModal(b)}
                              className="px-3 py-1.5 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/40 text-[#142D26] text-xs font-medium hover:bg-[#142D26] hover:text-white transition-colors cursor-pointer"
                            >
                              Details
                            </button>

                            {/* Status Changer Dropdown */}
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.bookingRef, e.target.value as any)}
                              className="h-8 px-2.5 rounded-lg bg-white border border-[#D5AD72]/60 text-xs font-semibold text-[#142D26] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D5AD72]"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Checked-In">Checked-In</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteBooking(b.bookingRef)}
                              className="p-1.5 rounded-lg text-[#575757] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete reservation"
                              aria-label="Delete reservation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROOM INVENTORY & RATES */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#142D26]">Room Inventory & Nightly Rates</h2>
                <p className="text-xs text-[#575757]">
                  All prices are calibrated in Nigerian Naira (₦). Rates update live across all room cards and booking modals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomsList.map((room) => {
                const isEditing = editingRoomId === room.RoomID;

                return (
                  <div
                    key={room.RoomID}
                    className="bg-white rounded-2xl border border-[#D5AD72]/35 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={room.ImageURL}
                          alt={room.Name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#142D26]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-medium">
                          {room.RoomID}
                        </div>
                        <div className="absolute top-3 right-3 bg-white/95 text-[#142D26] px-2.5 py-1 rounded text-xs font-semibold">
                          Max {room.MaxGuests} Guests
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-[#B88E52] font-semibold">
                            {room.Type}
                          </span>
                          <h3 className="text-lg font-serif font-bold text-[#142D26] mt-0.5">
                            {room.Name}
                          </h3>
                        </div>

                        <p className="text-xs text-[#575757] line-clamp-2">
                          {room.Description}
                        </p>

                        <div className="pt-2 border-t border-[#F7F5F0] flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-[#575757] block">Nightly Rate</span>
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-sm font-bold text-[#142D26]">₦</span>
                                <input
                                  type="number"
                                  value={editPriceInput}
                                  onChange={(e) => setEditPriceInput(Number(e.target.value))}
                                  className="w-28 h-8 px-2 border border-[#D5AD72] rounded text-sm font-bold text-[#142D26] focus:outline-none"
                                />
                              </div>
                            ) : (
                              <span className="text-xl font-serif font-bold text-[#142D26]">
                                {formatNaira(room.PricePerNight)}
                              </span>
                            )}
                          </div>

                          <div>
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSaveRoomRate(room.RoomID)}
                                  className="px-3 py-1.5 bg-[#142D26] text-white rounded text-xs font-semibold hover:bg-black"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingRoomId(null)}
                                  className="px-2 py-1.5 text-xs text-[#575757] hover:text-[#142D26]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingRoomId(room.RoomID);
                                  setEditPriceInput(room.PricePerNight);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-[#D5AD72]/50 text-xs font-semibold text-[#142D26] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                              >
                                Edit Rate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GUEST INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#142D26]">Guest Relations & Messages</h2>
                <p className="text-xs text-[#575757]">
                  Inquiries received from the Contact Us form and concierge portal.
                </p>
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#D5AD72]/30 p-8 space-y-2">
                <Mail className="w-10 h-10 text-[#D5AD72] mx-auto" />
                <h3 className="text-lg font-serif font-bold text-[#142D26]">No inquiries logged</h3>
                <p className="text-xs text-[#575757]">New messages from website visitors will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-[#D5AD72]/35 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F7F5F0] pb-3">
                      <div>
                        <h4 className="text-base font-serif font-bold text-[#142D26]">{c.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#575757] mt-0.5">
                          <span>{c.email}</span>
                          {c.phone && <span>· {c.phone}</span>}
                          <span>· {new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              c.name
                            )},%20this%20is%20HavenStay%20Hotels.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        <a
                          href={`mailto:${c.email}`}
                          className="px-3 py-1.5 rounded-lg bg-[#142D26] text-white text-xs font-medium hover:bg-black"
                        >
                          Email Reply
                        </a>
                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          className="p-1.5 text-[#575757] hover:text-red-600 rounded"
                          title="Delete message"
                          aria-label="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#242424]/85 leading-relaxed bg-[#F7F5F0] p-3.5 rounded-xl border border-[#D5AD72]/20">
                      "{c.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GOOGLE SHEETS SYNC */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D5AD72]/40 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#107c41]/10 text-[#107c41] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-[#142D26]">
                    Google Sheets & Apps Script Integration
                  </h3>
                  <p className="text-xs sm:text-sm text-[#575757]">
                    HavenStay Hotels connects with your Google Spreadsheet to back up confirmed bookings, contacts, and newsletter subscribers.
                  </p>
                </div>
              </div>

              {/* Endpoint Status Box */}
              <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#D5AD72]/30 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#142D26]">Deployed Apps Script Web App URL:</span>
                  <span className="text-[11px] text-emerald-700 font-medium">Configured in production</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#D5AD72]/20 font-mono text-xs text-[#142D26] break-all">
                  {APPS_SCRIPT_URL}
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-semibold text-[#142D26]">Spreadsheet ID:</span>
                  <span className="font-mono text-xs text-[#575757]">1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqplHM</span>
                </div>
              </div>

              {/* Ping Test Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePingGoogleSheets}
                  disabled={pingLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#142D26] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${pingLoading ? 'animate-spin' : ''}`} />
                  <span>{pingLoading ? 'Testing Live Connection...' : 'Test Live Endpoint Connection'}</span>
                </button>

                <a
                  href="https://docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqplHM/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white border border-[#D5AD72] text-[#142D26] text-xs sm:text-sm font-semibold hover:bg-[#F7F5F0] transition-colors"
                >
                  <span>Open Google Spreadsheet</span>
                  <ExternalLink className="w-4 h-4 text-[#B88E52]" />
                </a>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D5AD72] text-[#142D26] text-xs sm:text-sm font-semibold hover:bg-[#e0bb82] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup CSV</span>
                </button>
              </div>

              {/* Ping Result Notification */}
              {pingResult && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                    pingResult.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  {pingResult.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {pingResult.ok ? 'Connection Verified' : 'Diagnostic Notice'}
                    </span>
                    <span>{pingResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL RECEIPT MODAL */}
      <AnimatePresence>
        {activeReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReceiptModal(null)}
              className="fixed inset-0 bg-[#142D26]/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#D5AD72]/40 z-10 overflow-hidden my-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#142D26] text-white">
                <div>
                  <h3
                    className="text-lg font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    HavenStay Reservation Voucher
                  </h3>
                  <span className="text-xs text-[#D5AD72] font-mono">
                    Ref: {activeReceiptModal.bookingRef}
                  </span>
                </div>
                <button
                  onClick={() => setActiveReceiptModal(null)}
                  className="p-1 rounded-full text-white/70 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#F7F5F0]">
                  <div>
                    <span className="text-xs text-[#575757] block">Guest Name</span>
                    <span className="font-bold text-[#142D26] text-base">{activeReceiptModal.fullName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#575757] block">Status</span>
                    <span className="font-semibold text-emerald-700">{activeReceiptModal.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Phone Number</span>
                    <span className="font-medium text-[#142D26]">{activeReceiptModal.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Email Address</span>
                    <span className="font-medium text-[#142D26]">{activeReceiptModal.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Reserved Suite</span>
                    <span className="font-medium text-[#142D26]">{activeReceiptModal.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Check-In</span>
                    <span className="font-medium text-[#142D26]">{activeReceiptModal.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Check-Out</span>
                    <span className="font-medium text-[#142D26]">{activeReceiptModal.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Duration</span>
                    <span className="font-medium text-[#142D26]">
                      {activeReceiptModal.nights} {activeReceiptModal.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Guests</span>
                    <span className="font-medium text-[#142D26]">
                      {activeReceiptModal.adults} Adults{activeReceiptModal.children ? `, ${activeReceiptModal.children} Children` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Nightly Rate</span>
                    <span className="font-medium text-[#142D26]">{formatNaira(activeReceiptModal.pricePerNight)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Payment Preference</span>
                    <span className="font-medium text-[#B88E52]">{activeReceiptModal.paymentPref}</span>
                  </div>
                </div>

                {activeReceiptModal.requests && (
                  <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/20">
                    <span className="text-xs font-semibold text-[#142D26] block">Special Requests</span>
                    <p className="text-xs text-[#575757] mt-0.5">{activeReceiptModal.requests}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-[#D5AD72]/30 flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#142D26]">Total Amount</span>
                  <span
                    className="text-2xl font-serif font-bold text-[#142D26]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {formatNaira(activeReceiptModal.total)}
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={getWhatsAppMessage(activeReceiptModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#20ba59]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Guest</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/50 text-[#142D26] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#ECE8DE]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MANUAL WALK-IN MODAL */}
      <AnimatePresence>
        {isManualBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualBookingOpen(false)}
              className="fixed inset-0 bg-[#142D26]/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#D5AD72]/40 z-10 overflow-hidden my-6"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-[#142D26] text-white">
                <h3
                  className="text-lg font-serif font-bold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  New Walk-In Reservation
                </h3>
                <button
                  onClick={() => setIsManualBookingOpen(false)}
                  className="p-1 rounded-full text-white/70 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleManualBookingSubmit} className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="manual-room"
                    className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                  >
                    Select Room Type
                  </label>
                  <select
                    id="manual-room"
                    value={manualForm.roomId}
                    onChange={(e) => setManualForm({ ...manualForm, roomId: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm font-medium"
                  >
                    {roomsList.map((r) => (
                      <option key={r.RoomID} value={r.RoomID}>
                        {r.Name} ({formatNaira(r.PricePerNight)} / night)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="manual-fullname"
                      className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                    >
                      Guest Full Name
                    </label>
                    <input
                      id="manual-fullname"
                      type="text"
                      required
                      value={manualForm.fullName}
                      onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                      placeholder="e.g. Babatunde Lawal"
                      className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="manual-phone"
                      className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="manual-phone"
                      type="tel"
                      required
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      placeholder="+234 803 123 4567"
                      className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="manual-email"
                    className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="manual-email"
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="guest@example.com"
                    className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="manual-checkin"
                      className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                    >
                      Check-In Date
                    </label>
                    <input
                      id="manual-checkin"
                      type="date"
                      required
                      value={manualForm.checkIn}
                      onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="manual-checkout"
                      className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                    >
                      Check-Out Date
                    </label>
                    <input
                      id="manual-checkout"
                      type="date"
                      required
                      value={manualForm.checkOut}
                      onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="manual-notes"
                    className="block text-xs font-semibold uppercase text-[#142D26] mb-1"
                  >
                    Staff Notes / Requests
                  </label>
                  <input
                    id="manual-notes"
                    type="text"
                    value={manualForm.requests}
                    onChange={(e) => setManualForm({ ...manualForm, requests: e.target.value })}
                    placeholder="Walk-in counter guest, paid cash or POS..."
                    className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsManualBookingOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs text-[#575757] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="gold" size="sm">
                    Confirm Walk-In Stay
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
