import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  LogOut,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
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
  TrendingUp,
  Sliders,
  Check,
  ChevronDown,
  Trash2,
  X,
  Building,
  Utensils,
  Wine,
  Sparkles,
  PartyPopper,
  Tag,
  Image,
  Globe,
  Edit3,
  Save,
  Copy,
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
import { isAdminAuthenticated, adminLogout, getAdminUser } from '../services/auth';
import { formatNaira } from '../utils/currency';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { DINING_VENUES } from '../components/DiningShowcase';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

type DashboardSection =
  | 'reservations'
  | 'rooms'
  | 'dining'
  | 'pool-bar'
  | 'events'
  | 'offers'
  | 'gallery'
  | 'inquiries'
  | 'website';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const currentUser = getAdminUser();

  // Route Protection: Redirect if unauthenticated
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      showToast('Access restricted. Please authenticate first.', 'error');
      onNavigate('admin-login');
    }
  }, [onNavigate, showToast]);

  // Active Dashboard Section
  const [activeSection, setActiveSection] = useState<DashboardSection>('reservations');

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
  const [copiedScript, setCopiedScript] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    if (isAdminAuthenticated()) {
      refreshData();
    }
  }, []);

  const refreshData = () => {
    setBookings(getStoredBookings());
    setContacts(getStoredContacts());
  };

  // Logout Handler
  const handleLogout = async () => {
    await adminLogout();
    showToast('Administrator session terminated successfully.', 'info');
    onNavigate('admin-login');
  };

  // Status Update Handler
  const handleStatusChange = (ref: string, newStatus: BookingRecord['status']) => {
    const updated = updateStoredBookingStatus(ref, newStatus);
    setBookings(updated);
    showToast(`Reservation ${ref} marked as ${newStatus}`, 'success');
  };

  // Delete Booking Handler
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

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
      if (selectedStatusFilter !== 'All' && b.status !== selectedStatusFilter) {
        return false;
      }
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
    const confirmedCount = bookings.filter(
      (b) => b.status === 'Confirmed' || b.status === 'Checked-In'
    ).length;
    const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
    const totalRevenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    return {
      totalCount,
      confirmedCount,
      pendingCount,
      totalRevenue,
    };
  }, [bookings]);

  // WhatsApp Message Generator
  const getWhatsAppMessage = (b: BookingRecord) => {
    const text = `Hello ${b.fullName},\n\nThis is HavenStay Hotels regarding your reservation (${b.bookingRef}) for the ${b.roomName}.\n\nDates: ${b.checkIn} to ${b.checkOut} (${b.nights} nights)\nTotal: ${formatNaira(b.total)}\nStatus: ${b.status}\n\nWe look forward to welcoming you to HavenStay! Please feel free to reply with any arrival details or questions.`;
    const cleanPhone = b.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // If unauthenticated, show security guard screen while redirecting
  if (!isAdminAuthenticated()) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-[#F7F5F0]">
        <div className="text-center space-y-3 p-8 bg-white rounded-2xl border border-[#D5AD72]/40 shadow-md max-w-sm">
          <Shield className="w-10 h-10 text-[#142D26] mx-auto animate-pulse" />
          <h2 className="text-lg font-serif font-bold text-[#142D26]">Protected Portal</h2>
          <p className="text-xs text-[#575757]">
            Redirecting to Administrator Login...
          </p>
          <Button variant="gold" size="sm" onClick={() => onNavigate('admin-login')}>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#F7F5F0] text-[#242424]">
      {/* Top Admin Header Bar */}
      <div className="bg-[#142D26] text-white border-b border-[#D5AD72]/30 py-5 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-[#D5AD72]/20 text-[#D5AD72] text-[11px] font-semibold tracking-wider uppercase">
                Hotel Operations Portal
              </span>
              <span className="text-xs text-white/60">
                Logged in as: <strong className="text-white">{currentUser?.email || 'Administrator'}</strong>
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              HavenStay Management Dashboard
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs font-semibold border border-red-400/30 transition-colors cursor-pointer"
              title="Terminate Administrator Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
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
              <span>All active reservations</span>
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
              <span>Require staff follow-up</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#575757]">
              <span>Room Inventory</span>
              <Bed className="w-4 h-4 text-[#142D26]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]">
              {roomsList.length} Suites
            </div>
            <div className="text-[11px] text-[#575757]">
              <span>Calibrated in ₦ Naira</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs (Covering all requested hotel management areas) */}
        <div className="flex items-center gap-2 border-b border-[#D5AD72]/30 overflow-x-auto pb-px scrollbar-none">
          {[
            { id: 'reservations', label: 'Reservations & Guests', count: bookings.length },
            { id: 'rooms', label: 'Rooms & Suites', count: roomsList.length },
            { id: 'dining', label: 'Dining & Venues', count: 3 },
            { id: 'pool-bar', label: 'Pool & Bar', count: null },
            { id: 'events', label: 'Events & Weddings', count: null },
            { id: 'offers', label: 'Offers & Packages', count: null },
            { id: 'gallery', label: 'Visual Gallery', count: null },
            { id: 'inquiries', label: 'Contact Inquiries', count: contacts.length },
            { id: 'website', label: 'Website & Sheets Sync', count: null },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as DashboardSection)}
                className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#142D26] text-[#142D26] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-[#575757] hover:text-[#142D26]'
                }`}
              >
                <span>
                  {tab.label} {tab.count !== null ? `(${tab.count})` : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* SECTION 1: RESERVATIONS & GUESTS */}
        {activeSection === 'reservations' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#D5AD72]/30 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#575757] absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guest name, phone (+234...), ref, or room..."
                  className="w-full h-10 pl-9 pr-4 bg-[#F7F5F0] border border-[#D5AD72]/30 rounded-lg text-xs sm:text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D5AD72]"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', 'Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled'].map(
                  (status) => (
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
                  )
                )}
              </div>
            </div>

            {/* Bookings List */}
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
                                {b.checkIn} to {b.checkOut} ({b.nights}{' '}
                                {b.nights === 1 ? 'night' : 'nights'})
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

                            <button
                              onClick={() => setActiveReceiptModal(b)}
                              className="px-3 py-1.5 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/40 text-[#142D26] text-xs font-medium hover:bg-[#142D26] hover:text-white transition-colors cursor-pointer"
                            >
                              Voucher
                            </button>

                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleStatusChange(b.bookingRef, e.target.value as any)
                              }
                              className="h-8 px-2.5 rounded-lg bg-white border border-[#D5AD72]/60 text-xs font-semibold text-[#142D26] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D5AD72]"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Checked-In">Checked-In</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

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

        {/* SECTION 2: ROOMS & SUITES */}
        {activeSection === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#142D26]">
                  Room Inventory & Nightly Pricing (NGN ₦)
                </h2>
                <p className="text-xs text-[#575757]">
                  All room rates synchronize across the public website and booking checkout.
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

        {/* SECTION 3: DINING & VENUES */}
        {activeSection === 'dining' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142D26]">
                Culinary Venues & Gastronomy Management
              </h2>
              <p className="text-xs text-[#575757]">
                Manage operating hours, dress codes, and signature dishes for hotel dining spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DINING_VENUES.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-[#D5AD72]/30 p-5 space-y-4 shadow-xs"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img src={v.imageUrl} alt={v.tabLabel} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[#142D26]/90 text-white text-[11px] px-2 py-0.5 rounded font-medium">
                      {v.kicker}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#142D26]">{v.tabLabel}</h3>
                    <p className="text-xs text-[#575757] mt-1 line-clamp-2">{v.bodyPara1}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#242424] pt-2 border-t border-[#F7F5F0]">
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Hours:</span>
                      <span className="font-medium text-right text-[11px]">{v.hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Dress Code:</span>
                      <span className="font-medium">{v.dressCode}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[#575757] block text-[11px]">Signature Creation:</span>
                      <span className="font-semibold text-[#142D26] text-xs block">
                        {v.signatureDish}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: POOL & BAR */}
        {activeSection === 'pool-bar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142D26]">
                Palms Pool & Sunset Bar Controls
              </h2>
              <p className="text-xs text-[#575757]">
                Manage temperature parameters, VIP cabana availability, and evening mixology sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#D5AD72]/30 space-y-3 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B88E52]">
                  Water Temperature
                </span>
                <div className="text-3xl font-serif font-bold text-[#142D26]">28°C / 82°F</div>
                <p className="text-xs text-[#575757]">
                  Heated year-round with automated climate monitoring.
                </p>
                <div className="pt-2 text-xs text-emerald-700 font-medium">
                  Status: Optimal Comfort
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D5AD72]/30 space-y-3 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B88E52]">
                  Cabana Loungers
                </span>
                <div className="text-3xl font-serif font-bold text-[#142D26]">12 Available</div>
                <p className="text-xs text-[#575757]">
                  Dedicated poolside daybeds with butler call buttons.
                </p>
                <div className="pt-2 text-xs text-[#142D26] font-medium">
                  Reservations via Concierge Desk
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D5AD72]/30 space-y-3 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B88E52]">
                  Sunset Golden Hour
                </span>
                <div className="text-3xl font-serif font-bold text-[#142D26]">5:30 – 7:30 PM</div>
                <p className="text-xs text-[#575757]">
                  Artisan mixologist cocktails, live acoustic ambient sessions.
                </p>
                <div className="pt-2 text-xs text-[#B88E52] font-medium">
                  Active Every Day
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: EVENTS & WEDDINGS */}
        {activeSection === 'events' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142D26]">
                Events, Conferences & Grand Ballroom
              </h2>
              <p className="text-xs text-[#575757]">
                Overview of banquet halls, corporate boardroom reservations, and catering setups.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D5AD72]/30 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <PartyPopper className="w-6 h-6 text-[#D5AD72]" />
                <h3 className="text-lg font-serif font-bold text-[#142D26]">
                  Event Spaces Directory
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#D5AD72]/20">
                  <span className="font-bold text-[#142D26] block">The Grand Haven Ballroom</span>
                  <span className="text-xs text-[#575757]">Capacity: Up to 350 Guests</span>
                  <p className="text-xs text-[#242424]/80 mt-1">
                    Crystal chandeliers, state-of-the-art acoustic sound and projection.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#D5AD72]/20">
                  <span className="font-bold text-[#142D26] block">Executive Boardroom A</span>
                  <span className="text-xs text-[#575757]">Capacity: Up to 24 Delegates</span>
                  <p className="text-xs text-[#242424]/80 mt-1">
                    Conference video system, ergonomic leather seating, private espresso bar.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#D5AD72]/20">
                  <span className="font-bold text-[#142D26] block">The Garden Courtyard</span>
                  <span className="text-xs text-[#575757]">Capacity: Up to 180 Guests</span>
                  <p className="text-xs text-[#242424]/80 mt-1">
                    Open-air cocktail soirees, wedding receptions, and sunset ceremonies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: OFFERS & PACKAGES */}
        {activeSection === 'offers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142D26]">
                Direct Booking Privileges & Seasonal Offers
              </h2>
              <p className="text-xs text-[#575757]">
                Manage promotional packages shown to prospective guests on the Offers page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 space-y-2 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#B88E52]">Direct Privilege</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Live
                  </span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#142D26]">
                  Complimentary Artisan Breakfast
                </h4>
                <p className="text-xs text-[#575757]">
                  Served daily for all direct website bookings in Deluxe King & Suites.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D5AD72]/30 space-y-2 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#B88E52]">Weekend Special</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Live
                  </span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#142D26]">
                  Extended Sunday Late Check-Out (3:00 PM)
                </h4>
                <p className="text-xs text-[#575757]">
                  Guaranteed late check-out on all Friday-to-Sunday stays.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: VISUAL GALLERY */}
        {activeSection === 'gallery' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142D26]">
                Visual Media & Photography Asset Manager
              </h2>
              <p className="text-xs text-[#575757]">
                High-resolution architectural, suite, and lifestyle imagery displayed across HavenStay.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Deluxe King Suite', url: '/images/hotel/deluxe-1.jpg' },
                { title: 'Executive Living Room', url: '/images/hotel/executive-suite-1.jpg' },
                { title: 'Penthouse Master', url: '/images/hotel/presidential-1.jpg' },
                { title: 'Sunset Lap Pool', url: '/videos/swimming-pool.jpg' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#D5AD72]/30 shadow-xs group"
                >
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-white">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: CONTACT INQUIRIES */}
        {activeSection === 'inquiries' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#142D26]">
                Guest Inquiries & Messages
              </h2>
              <p className="text-xs text-[#575757]">
                Messages submitted through the public website contact form.
              </p>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#D5AD72]/30 p-8 space-y-2">
                <Mail className="w-10 h-10 text-[#D5AD72] mx-auto" />
                <h3 className="text-lg font-serif font-bold text-[#142D26]">No inquiries logged</h3>
                <p className="text-xs text-[#575757]">
                  New inquiries from visitors will appear here.
                </p>
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
                          Email
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

        {/* SECTION 9: WEBSITE & GOOGLE SHEETS SYNC */}
        {activeSection === 'website' && (
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
                    HavenStay Hotels connects with your Google Spreadsheet to back up confirmed
                    bookings, contacts, and newsletter subscribers.
                  </p>
                </div>
              </div>

              {/* Endpoint Status Box */}
              <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#D5AD72]/30 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#142D26]">
                    Deployed Apps Script Web App URL:
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Configured in production
                  </span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#D5AD72]/20 font-mono text-xs text-[#142D26] break-all">
                  {APPS_SCRIPT_URL}
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-semibold text-[#142D26]">Spreadsheet ID:</span>
                  <span className="font-mono text-xs text-[#575757]">
                    1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqplHM
                  </span>
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
                  <span>
                    {pingLoading ? 'Testing Live Connection...' : 'Test Live Endpoint Connection'}
                  </span>
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

              {/* Screenshot Diagnosis & Fix Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#F7F5F0] to-white border border-[#D5AD72]/40 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#D5AD72]/20 text-[#142D26] shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-5 h-5 text-[#B88E52]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#142D26] text-sm sm:text-base">
                      Important: Why reservations were not appearing in your Google Spreadsheet
                    </h4>
                    <p className="text-xs text-[#575757] mt-1 leading-relaxed">
                      In your spreadsheet screenshot, your document only contains two default blank tabs: <strong className="text-[#142D26]">Sheet1</strong> and <strong className="text-[#142D26]">Sheet2</strong>. The Google Apps Script expects a sheet named <strong className="text-[#142D26]">"Bookings"</strong> to write reservation rows into.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg bg-white border border-[#D5AD72]/30 space-y-1.5">
                    <span className="text-xs font-bold text-[#142D26] block">Method 1: Rename "Sheet1" tab</span>
                    <p className="text-[11px] text-[#575757] leading-relaxed">
                      In your Google Sheet at the bottom left, double click <strong className="text-[#142D26]">"Sheet1"</strong> and rename it to <strong className="text-[#142D26]">"Bookings"</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-[#D5AD72]/30 space-y-1.5">
                    <span className="text-xs font-bold text-[#142D26] block">Method 2: Use Self-Healing Apps Script</span>
                    <p className="text-[11px] text-[#575757] leading-relaxed">
                      Copy the complete script below into your Apps Script editor. It will automatically create all missing sheets with headers!
                    </p>
                  </div>
                </div>

                {/* Copyable Script Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#142D26] p-4 rounded-xl text-white">
                  <div>
                    <span className="text-xs font-semibold block text-[#D5AD72]">Complete Self-Healing Apps Script Code</span>
                    <span className="text-[11px] text-white/70">Includes auto-sheet creation, headers, GET & POST booking handlers</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const fullCode = `const SPREADSHEET_ID = '1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqplHM';
const HOTEL_EMAIL = 'egutudanny6@gmail.com';

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#142D26').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function setup() {
  const ss = getSpreadsheet_();
  getOrCreateSheet_(ss, 'Bookings', [
    'Booking Reference', 'Date Created', 'Room ID', 'Room Name',
    'Check-In', 'Check-Out', 'Nights', 'Adults', 'Children',
    'Price Per Night (NGN)', 'Total Amount (NGN)', 'Guest Full Name',
    'Guest Email', 'Guest Phone', 'Payment Preference', 'Special Requests', 'Status'
  ]);
  getOrCreateSheet_(ss, 'Rooms', [
    'Room ID', 'Room Name', 'Type', 'Price Per Night (NGN)',
    'Max Guests', 'Bed Type', 'Room Size', 'Active', 'Description', 'Amenities', 'Image URL'
  ]);
  getOrCreateSheet_(ss, 'Contacts', ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status']);
  getOrCreateSheet_(ss, 'Newsletter', ['Date', 'Email']);
  return 'Setup completed successfully! Tabs Bookings, Rooms, Contacts, and Newsletter created.';
}

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    if (action === 'rooms') return json_(getRooms_());
    if (action === 'availability') {
      return json_(isAvailable_(e.parameter.roomId, e.parameter.checkIn, e.parameter.checkOut));
    }
    if (action === 'book') {
      return json_(saveBooking_(e.parameter));
    }
    return json_({ ok: true, hotel: 'HavenStay Hotels', timestamp: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);
    if (data.type === 'contact') return json_(saveContact_(data));
    if (data.type === 'newsletter') return json_(saveNewsletter_(data));
    return json_(saveBooking_(data));
  } catch (err) {
    return json_({ success: false, message: 'Server error: ' + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getRooms_() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Rooms');
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function isAvailable_(roomId, checkIn, checkOut) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Bookings');
  if (!sheet) return { available: true };
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { available: true };
  const ci = new Date(checkIn), co = new Date(checkOut);
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[2]) === String(roomId)) {
      const bci = new Date(row[4]), bco = new Date(row[5]);
      if (ci < bco && co > bci) return { available: false, message: 'Room already booked for those dates.' };
    }
  }
  return { available: true };
}

function saveBooking_(d) {
  const required = ['roomId', 'checkIn', 'checkOut', 'adults', 'fullName', 'email', 'phone'];
  for (const k of required) {
    if (!d[k]) return { success: false, message: 'Missing field: ' + k };
  }
  const ss = getSpreadsheet_();
  const sheet = getOrCreateSheet_(ss, 'Bookings', [
    'Booking Reference', 'Date Created', 'Room ID', 'Room Name',
    'Check-In', 'Check-Out', 'Nights', 'Adults', 'Children',
    'Price Per Night (NGN)', 'Total Amount (NGN)', 'Guest Full Name',
    'Guest Email', 'Guest Phone', 'Payment Preference', 'Special Requests', 'Status'
  ]);

  const ci = new Date(d.checkIn), co = new Date(d.checkOut);
  const nights = Math.max(1, Math.round((co - ci) / 86400000));
  const price = Number(d.pricePerNight) || 165000;
  const total = nights * price;
  const ref = 'HS-' + Utilities.getUuid().slice(0, 6).toUpperCase();

  sheet.appendRow([
    ref,
    new Date(),
    d.roomId,
    d.roomName || 'HavenStay Luxury Room',
    d.checkIn,
    d.checkOut,
    nights,
    Number(d.adults) || 1,
    Number(d.children) || 0,
    price,
    total,
    d.fullName,
    d.email,
    d.phone,
    d.paymentPref || 'Pay at hotel',
    d.requests || '',
    'Confirmed'
  ]);

  return {
    success: true,
    bookingRef: ref,
    nights: nights,
    total: total,
    message: 'Booking confirmed!'
  };
}

function saveContact_(d) {
  const ss = getSpreadsheet_();
  const sheet = getOrCreateSheet_(ss, 'Contacts', ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status']);
  sheet.appendRow([new Date(), d.name, d.email, d.phone, d.message, 'New']);
  return { success: true };
}

function saveNewsletter_(d) {
  const ss = getSpreadsheet_();
  const sheet = getOrCreateSheet_(ss, 'Newsletter', ['Date', 'Email']);
  sheet.appendRow([new Date(), d.email]);
  return { success: true };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;
                      navigator.clipboard.writeText(fullCode);
                      setCopiedScript(true);
                      showToast('Self-healing Apps Script copied to clipboard!', 'success');
                      setTimeout(() => setCopiedScript(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D5AD72] text-[#142D26] text-xs font-bold hover:bg-[#e0bb82] transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
                  </button>
                </div>
              </div>
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

              <div className="p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#F7F5F0]">
                  <div>
                    <span className="text-xs text-[#575757] block">Guest Name</span>
                    <span className="font-bold text-[#142D26] text-base">
                      {activeReceiptModal.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#575757] block">Status</span>
                    <span className="font-semibold text-emerald-700">
                      {activeReceiptModal.status}
                    </span>
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
                    <span className="font-medium text-[#142D26]">
                      {activeReceiptModal.roomName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Check-In</span>
                    <span className="font-medium text-[#142D26]">{activeReceiptModal.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Check-Out</span>
                    <span className="font-medium text-[#142D26]">
                      {activeReceiptModal.checkOut}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Duration</span>
                    <span className="font-medium text-[#142D26]">
                      {activeReceiptModal.nights} {activeReceiptModal.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Nightly Rate</span>
                    <span className="font-medium text-[#142D26]">
                      {formatNaira(activeReceiptModal.pricePerNight)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#575757]">Payment Preference</span>
                    <span className="font-medium text-[#B88E52]">
                      {activeReceiptModal.paymentPref}
                    </span>
                  </div>
                </div>

                {activeReceiptModal.requests && (
                  <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/20">
                    <span className="text-xs font-semibold text-[#142D26] block">
                      Special Requests
                    </span>
                    <p className="text-xs text-[#575757] mt-0.5">
                      {activeReceiptModal.requests}
                    </p>
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
                    <span>Print Voucher</span>
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
