import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Users,
  BarChart3,
  Utensils,
  Sparkles,
  Image as ImageIcon,
  Globe,
  Settings,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
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
  Edit3,
  Trash2,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Shield,
  Menu,
  X,
  Copy,
  Check,
  Building,
  Save,
  Tag,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { BookingRecord, Room, AdminPortalSection, AdminUser } from '../types';
import {
  fetchAdminReservations,
  updateAdminReservationStatus,
  deleteAdminReservation,
  fetchAdminStats,
  MOCK_ROOMS,
  APPS_SCRIPT_URL,
} from '../config/api';
import { CODE_GS_CONTENT } from '../config/appsScriptCode';
import { adminLogout, getAdminUser } from '../services/auth';
import { formatNaira } from '../utils/currency';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface AdminPortalDashboardProps {
  onLogout: () => void;
}

export const AdminPortalDashboard: React.FC<AdminPortalDashboardProps> = ({ onLogout }) => {
  const { showToast } = useToast();
  const currentUser: AdminUser | null = getAdminUser();

  // Active Management Section
  const [activeSection, setActiveSection] = useState<AdminPortalSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Reservations Data
  const [reservations, setReservations] = useState<BookingRecord[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'total' | 'name'>('date');

  // Active Detail Receipt Modal
  const [activeReservationModal, setActiveReservationModal] = useState<BookingRecord | null>(null);

  // Manual Walk-in Modal State
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
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

  // Room Inventory State
  const [roomsList, setRoomsList] = useState<Room[]>(() => {
    const saved = localStorage.getItem('havenstay_admin_rooms');
    return saved ? JSON.parse(saved) : MOCK_ROOMS;
  });
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState<Partial<Room>>({
    RoomID: 'ROOM-' + Math.floor(100 + Math.random() * 900),
    Name: '',
    Type: 'Deluxe',
    PricePerNight: 185000,
    MaxGuests: 2,
    BedType: '1 King Bed',
    RoomSize: '42 m²',
    Amenities: 'Wi-Fi, Air conditioning, Smart TV, Rainfall shower, City view',
    ImageURL: '/images/hotel/deluxe-1.jpg',
    Description: '',
    Active: true,
  });

  // Dining Venues State
  const [diningVenues, setDiningVenues] = useState([
    {
      id: 'sofia',
      name: 'Sofia Restaurant',
      hours: '06:30 AM – 11:00 PM',
      dressCode: 'Smart Casual',
      menuCount: 24,
      tagline: 'Refined pan-African & European gastronomy',
    },
    {
      id: 'pool-bar',
      name: 'Palms Pool & Sunset Bar',
      hours: '10:00 AM – Midnight',
      dressCode: 'Resort Casual',
      menuCount: 18,
      tagline: 'Artisan cocktails, chilled oysters & sunset lounge',
    },
    {
      id: 'in-room',
      name: 'In-Room Suite Dining',
      hours: '24 Hours / 7 Days',
      dressCode: 'Come as you are',
      menuCount: 30,
      tagline: 'Gourmet comfort delivered to your suite door',
    },
  ]);

  // Events & Offers State
  const [offersList, setOffersList] = useState([
    {
      id: 'OFFER-1',
      title: 'Weekend Escape in Haven City',
      badge: '20% OFF',
      validThrough: 'Dec 31, 2026',
      status: 'Active',
      description: 'Enjoy 20% off all luxury suites including champagne breakfast and 2:00 PM late checkout.',
    },
    {
      id: 'OFFER-2',
      title: 'Executive Corporate Conference Retreat',
      badge: 'BUSINESS',
      validThrough: 'Nov 30, 2026',
      status: 'Active',
      description: 'Exclusive delegate rates for Grand Ballroom bookings with complimentary high-speed fiber Wi-Fi.',
    },
    {
      id: 'OFFER-3',
      title: 'Penthouse Honeymoon & Romance Package',
      badge: 'EXCLUSIVE',
      validThrough: 'Ongoing',
      status: 'Active',
      description: 'Two nights in the Premier Penthouse, private candlelit terrace dinner, and spa vouchers.',
    },
  ]);

  // Gallery Management State
  const [galleryPhotos, setGalleryPhotos] = useState([
    { id: 'GAL-1', title: 'Presidential Penthouse Terrace', category: 'Suites', url: '/images/hotel/presidential-1.jpg' },
    { id: 'GAL-2', title: 'Palms Sunset Poolside', category: 'Pool & Bar', url: '/images/hotel/pool-1.jpg' },
    { id: 'GAL-3', title: 'Executive Master Bedroom', category: 'Suites', url: '/images/hotel/executive-suite-1.jpg' },
    { id: 'GAL-4', title: 'Sofia Fine Dining Room', category: 'Dining', url: '/images/hotel/restaurant-1.jpg' },
    { id: 'GAL-5', title: 'Grand Exterior Architecture Dusk', category: 'Architecture', url: '/images/hotel/exterior-dusk.jpg' },
  ]);

  // Website Content Settings State
  const [contentSettings, setContentSettings] = useState({
    hotelName: 'HavenStay Hotels',
    tagline: 'Your Comfort, Our Priority.',
    phone: '+234 907 577 2701',
    whatsapp: '+234 907 577 2701',
    email: 'egutudanny6@gmail.com',
    address: '450 Grand Horizon Boulevard, Prime District, Haven City, Nigeria',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    heroHeadline: 'Experience Unrivaled Comfort & Quiet Luxury',
  });

  // Google Sheets Ping & Sync States
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState(
    () => localStorage.getItem('havenstay_custom_apps_script_url') || APPS_SCRIPT_URL
  );
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncSheetResult, setSyncSheetResult] = useState<string | null>(null);
  const [testBookingLoading, setTestBookingLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    loadReservationsData();
  }, []);

  const loadReservationsData = async () => {
    setLoadingReservations(true);
    try {
      const data = await fetchAdminReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations:', err);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Metrics Calculations
  const stats = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((r) => r.status === 'Pending').length;
    const confirmed = reservations.filter((r) => r.status === 'Confirmed' || r.status === 'Checked-In' || r.status === 'Completed').length;
    const cancelled = reservations.filter((r) => r.status === 'Cancelled' || r.status === ('Rejected' as any)).length;
    const totalRevenue = reservations
      .filter((r) => r.status === 'Confirmed' || r.status === 'Completed' || r.status === 'Checked-In')
      .reduce((sum, r) => sum + (r.total || 0), 0);
    const occupancyRate = Math.min(100, Math.round((confirmed / 18) * 100));

    return { total, pending, confirmed, cancelled, totalRevenue, occupancyRate };
  }, [reservations]);

  // Status Change Handler (Server-Synced)
  const handleStatusChange = async (ref: string, newStatus: BookingRecord['status']) => {
    const updated = await updateAdminReservationStatus(ref, newStatus);
    setReservations(updated);
    if (activeReservationModal && (activeReservationModal.id === ref || activeReservationModal.bookingRef === ref)) {
      setActiveReservationModal({ ...activeReservationModal, status: newStatus });
    }
    showToast(`Reservation ${ref} marked as ${newStatus}`, 'success');
  };

  // Delete Booking Handler
  const handleDeleteBooking = async (ref: string) => {
    if (window.confirm(`Are you sure you want to remove reservation record ${ref}?`)) {
      const updated = await deleteAdminReservation(ref);
      setReservations(updated);
      if (activeReservationModal && (activeReservationModal.id === ref || activeReservationModal.bookingRef === ref)) {
        setActiveReservationModal(null);
      }
      showToast(`Reservation ${ref} removed`, 'info');
    }
  };

  // Manual Walk-In Booking Handler
  const handleCreateWalkIn = (e: React.FormEvent) => {
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

    const updated = [record, ...reservations];
    setReservations(updated);
    localStorage.setItem('havenstay_mock_bookings', JSON.stringify(updated));
    setIsManualBookingOpen(false);
    showToast(`Walk-in reservation ${ref} created successfully!`, 'success');

    // Asynchronously sync to backend
    fetch('/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {});
  };

  // Add Room Handler
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.Name) return;
    const fullRoom: Room = {
      RoomID: newRoomForm.RoomID || 'ROOM-' + Math.floor(100 + Math.random() * 900),
      Name: newRoomForm.Name || 'New Suite',
      Type: (newRoomForm.Type as any) || 'Deluxe',
      PricePerNight: Number(newRoomForm.PricePerNight) || 165000,
      MaxGuests: Number(newRoomForm.MaxGuests) || 2,
      BedType: newRoomForm.BedType || '1 King Bed',
      RoomSize: newRoomForm.RoomSize || '40 m²',
      Amenities: newRoomForm.Amenities || 'Wi-Fi, Air conditioning, Smart TV',
      ImageURL: newRoomForm.ImageURL || '/images/hotel/deluxe-1.jpg',
      Description: newRoomForm.Description || 'Bespoke HavenStay accommodations.',
      Active: true,
    };
    const updated = [...roomsList, fullRoom];
    setRoomsList(updated);
    localStorage.setItem('havenstay_admin_rooms', JSON.stringify(updated));
    setIsAddRoomOpen(false);
    showToast(`Room ${fullRoom.Name} added to inventory`, 'success');
  };

  // Toggle Room Active
  const handleToggleRoomActive = (roomId: string) => {
    const updated = roomsList.map((r) =>
      r.RoomID === roomId ? { ...r, Active: !r.Active } : r
    );
    setRoomsList(updated);
    localStorage.setItem('havenstay_admin_rooms', JSON.stringify(updated));
    showToast('Room availability updated', 'info');
  };

  // Google Sheets Ping Test
  const handlePingGoogleSheets = async () => {
    setPingLoading(true);
    setPingResult(null);
    const start = Date.now();
    try {
      const targetUrl = appsScriptUrlInput.trim() || APPS_SCRIPT_URL;
      const res = await fetch(`${targetUrl}?action=rooms`);
      const latency = Date.now() - start;
      if (res.ok) {
        setPingResult({
          ok: true,
          message: `Connected successfully to Google Apps Script (${latency}ms).`,
        });
        showToast('Google Apps Script connection verified', 'success');
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

  const handleSaveAppsScriptUrl = async () => {
    const trimmed = appsScriptUrlInput.trim();
    if (!trimmed.startsWith('http')) {
      showToast('Please enter a valid URL starting with https://', 'error');
      return;
    }
    localStorage.setItem('havenstay_custom_apps_script_url', trimmed);
    const token = sessionStorage.getItem('havenstay_management_token') || localStorage.getItem('havenstay_management_token');
    try {
      await fetch('/api/admin/apps-script-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: trimmed }),
      });
      showToast('Apps Script Web App URL updated successfully', 'success');
    } catch {
      showToast('Saved to browser storage', 'info');
    }
  };

  const handleTestBookingToSheet = async () => {
    setTestBookingLoading(true);
    setSyncSheetResult(null);
    const token = sessionStorage.getItem('havenstay_management_token') || localStorage.getItem('havenstay_management_token');
    try {
      const res = await fetch('/api/admin/test-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: appsScriptUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncSheetResult(`Success: Diagnostic booking was received by Google Apps Script (${data.latency}ms). Refresh your Google Sheet to see the row!`);
        showToast('Test booking submitted to Sheet', 'success');
      } else {
        setSyncSheetResult(`Notice: ${data.message || 'Check your Google Sheet deployment'}`);
        showToast('Test booking notice', 'info');
      }
    } catch (err: any) {
      setSyncSheetResult(`Network error: ${err.message || 'Could not reach server'}`);
      showToast('Connection error', 'error');
    } finally {
      setTestBookingLoading(false);
    }
  };

  const handleSyncAllToSheet = async () => {
    setIsSyncingSheet(true);
    setSyncSheetResult(null);
    const token = sessionStorage.getItem('havenstay_management_token') || localStorage.getItem('havenstay_management_token');
    try {
      const res = await fetch('/api/admin/sync-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: appsScriptUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncSheetResult(`Sync complete! ${data.synced} of ${data.total} reservations were pushed to your Google Sheet.`);
        showToast(`Pushed ${data.synced} reservations to Sheet`, 'success');
      } else {
        setSyncSheetResult(`Sync issue: ${data.message}`);
        showToast('Sync error', 'error');
      }
    } catch (err: any) {
      setSyncSheetResult(`Error: ${err.message}`);
      showToast('Sync error', 'error');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handlePullFromSheet = async () => {
    setLoadingReservations(true);
    const targetUrl = appsScriptUrlInput.trim() || APPS_SCRIPT_URL;
    try {
      const res = await fetch(`${targetUrl}?action=bookings`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.reservations) && data.reservations.length > 0) {
          localStorage.setItem('havenstay_mock_bookings', JSON.stringify(data.reservations));
          setReservations(data.reservations);
          showToast(`Retrieved ${data.reservations.length} reservations from Google Sheet!`, 'success');
          return;
        }
      }
      showToast('To stream Google Sheet rows directly into Netlify, copy and deploy the updated Apps Script code.', 'info');
      setShowCodeModal(true);
    } catch (err: any) {
      showToast(`Connection error: ${err.message}`, 'error');
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleConfirmAllPending = async () => {
    const pendingList = reservations.filter((r) => r.status === 'Pending');
    if (pendingList.length === 0) {
      showToast('No pending reservations to confirm', 'info');
      return;
    }
    for (const r of pendingList) {
      await updateAdminReservationStatus(r.bookingRef || r.id, 'Confirmed');
    }
    const updated = await fetchAdminReservations();
    setReservations(updated);
    showToast(`Confirmed ${pendingList.length} pending reservations!`, 'success');
  };

  const handleCopyCodeGs = () => {
    try {
      navigator.clipboard.writeText(CODE_GS_CONTENT);
      setCopiedScript(true);
      showToast('Code.gs copied to clipboard!', 'success');
      setTimeout(() => setCopiedScript(false), 3000);
    } catch {
      showToast('Please select and copy the code manually', 'info');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (reservations.length === 0) {
      showToast('No reservations to export', 'error');
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
    const rows = reservations.map((b) => [
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
      `"${b.paymentPref || 'Pay at hotel'}"`,
      `"${(b.requests || '').replace(/"/g, '""')}"`,
      `"${b.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HavenStay_Reservations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reservations CSV downloaded successfully', 'success');
  };

  // Filtered & Sorted Reservations
  const filteredReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          r.fullName.toLowerCase().includes(q) ||
          r.bookingRef.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q);
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortField === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortField === 'total') return (b.total || 0) - (a.total || 0);
        return a.fullName.localeCompare(b.fullName);
      });
  }, [reservations, statusFilter, searchQuery, sortField]);

  // Unique Guests Derived from Reservations
  const uniqueGuests = useMemo(() => {
    const map = new Map<string, { guest: BookingRecord; count: number; spent: number }>();
    reservations.forEach((r) => {
      const key = r.email.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { guest: r, count: 1, spent: r.total || 0 });
      } else {
        const item = map.get(key)!;
        item.count += 1;
        item.spent += r.total || 0;
      }
    });
    return Array.from(map.values());
  }, [reservations]);

  // Navigation Items
  const navItems: { id: AdminPortalSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: <CalendarCheck className="w-4 h-4" />,
      badge: stats.pending > 0 ? stats.pending : undefined,
    },
    { id: 'rooms', label: 'Room Management', icon: <BedDouble className="w-4 h-4" /> },
    { id: 'guests', label: 'Guest Management', icon: <Users className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue & Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'dining', label: 'Dining Management', icon: <Utensils className="w-4 h-4" /> },
    { id: 'events-offers', label: 'Events and Offers', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery Management', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'website-content', label: 'Website Content', icon: <Globe className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0D1110] text-[#F7F5F0] flex font-sans selection:bg-[#D5AD72] selection:text-[#0D1110]">
      {/* 1. SIDEBAR (Desktop 260px) */}
      <aside className="hidden lg:flex w-64 bg-[#121615] border-r border-[#D5AD72]/20 flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E2523] to-[#121615] border border-[#D5AD72]/40 text-[#D5AD72] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span
                  className="font-serif font-bold text-white tracking-wider text-base block"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  HAVENSTAY
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#D5AD72] block">
                  MANAGEMENT PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#18201D] text-[#D5AD72] border border-[#D5AD72]/30 shadow-sm font-semibold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#D5AD72]' : 'text-white/50'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D5AD72] text-[#121615]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Administrator Profile Card & Logout */}
        <div className="p-4 border-t border-white/5 bg-[#0F1413]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#18201D] border border-[#D5AD72]/40 flex items-center justify-center text-[#D5AD72] text-xs font-bold shrink-0">
                DE
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-white block truncate">
                  {currentUser?.name || 'Danny Egutu'}
                </span>
                <span className="text-[10px] text-[#D5AD72] font-mono block">
                  Super Admin
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="relative w-72 bg-[#121615] border-r border-[#D5AD72]/20 h-full z-10 flex flex-col justify-between p-4"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#D5AD72]" />
                    <span className="font-serif font-bold text-white text-sm">HavenStay Portal</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        activeSection === item.id
                          ? 'bg-[#18201D] text-[#D5AD72] font-semibold'
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
              <div className="pt-4 border-t border-white/5">
                <Button variant="outline-gold" fullWidth size="sm" onClick={onLogout} icon={<LogOut className="w-4 h-4" />}>
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Contextual Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#D5AD72]/15 bg-[#121615]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40 hidden sm:inline">Portal</span>
              <span className="text-white/20 hidden sm:inline">/</span>
              <span className="text-[#D5AD72] font-semibold capitalize">
                {activeSection.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Pull from Sheet Button (Visible Everywhere) */}
            <button
              onClick={handlePullFromSheet}
              disabled={loadingReservations}
              title="Pull all live bookings directly from Google Sheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${loadingReservations ? 'animate-spin' : ''}`} />
              <span>{loadingReservations ? 'Pulling...' : 'Pull from Sheet'}</span>
            </button>

            {/* Quick Refresh Button */}
            <button
              onClick={() => {
                loadReservationsData();
                handlePullFromSheet();
              }}
              disabled={loadingReservations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#D5AD72]/50 text-white/80 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReservations ? 'animate-spin text-[#D5AD72]' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Direct Google Sheets Link */}
            <a
              href="https://docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 text-emerald-400 text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open Sheet</span>
            </a>

            {/* Quick Sync to Sheet Button */}
            <button
              onClick={handleSyncAllToSheet}
              disabled={isSyncingSheet}
              title="Push all reservations to Google Sheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#D5AD72]/40 text-white/70 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-bounce' : ''}`} />
              <span className="hidden xl:inline">{isSyncingSheet ? 'Pushing...' : 'Push to Sheet'}</span>
            </button>

            {/* Logout on Top Bar */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/50 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Section Content Area */}
        <main className="p-4 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* ========================================================= */}
          {/* SECTION 1: OVERVIEW */}
          {/* ========================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Top Greeting & Metric Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Hospitality Operations Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Real-time performance metrics and guest reservation pipeline for HavenStay Hotels.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handlePullFromSheet}
                    disabled={loadingReservations}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 ${loadingReservations ? 'animate-spin' : ''}`} />
                    <span>{loadingReservations ? 'Pulling Bookings...' : 'Pull from Sheet'}</span>
                  </button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setIsManualBookingOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Walk-In Reservation
                  </Button>
                  <Button
                    variant="outline-gold"
                    size="sm"
                    onClick={handleExportCSV}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* 5 Primary KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141A18] border border-[#D5AD72]/20 space-y-2">
                  <span className="text-xs text-white/50 block font-medium">Total Bookings</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                      {stats.total}
                    </span>
                    <CalendarCheck className="w-5 h-5 text-[#D5AD72]/60" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141A18] border border-amber-500/30 space-y-2">
                  <span className="text-xs text-amber-400 block font-medium">Pending Review</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 tabular-nums">
                      {stats.pending}
                    </span>
                    <Clock className="w-5 h-5 text-amber-400/70" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141A18] border border-emerald-500/30 space-y-2">
                  <span className="text-xs text-emerald-400 block font-medium">Confirmed Stays</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300 tabular-nums">
                      {stats.confirmed}
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400/70" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141A18] border border-[#D5AD72]/30 space-y-2">
                  <span className="text-xs text-[#D5AD72] block font-medium">Occupancy Rate</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                      {stats.occupancyRate}%
                    </span>
                    <TrendingUp className="w-5 h-5 text-[#D5AD72]" />
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1A2320] to-[#121615] border border-[#D5AD72]/40 space-y-2">
                  <span className="text-xs text-[#D5AD72] block font-medium">Confirmed Revenue</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#F3E5C8] tabular-nums truncate">
                      {formatNaira(stats.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Reservations Feed */}
              <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif font-bold text-white text-base">Recent Guest Bookings</h3>
                    <span className="text-[11px] text-white/50 font-mono">({reservations.length} records)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handlePullFromSheet}
                      disabled={loadingReservations}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-medium cursor-pointer transition-colors"
                      title="Fetch live records from Google Sheet"
                    >
                      <FileSpreadsheet className={`w-3.5 h-3.5 ${loadingReservations ? 'animate-spin' : ''}`} />
                      <span>Pull from Sheet</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('reservations')}
                      className="text-xs text-[#D5AD72] hover:underline cursor-pointer font-medium"
                    >
                      View All Reservations →
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[11px]">
                        <th className="pb-3 font-semibold">Ref</th>
                        <th className="pb-3 font-semibold">Guest</th>
                        <th className="pb-3 font-semibold">Suite</th>
                        <th className="pb-3 font-semibold">Check-In / Out</th>
                        <th className="pb-3 font-semibold text-right">Amount (NGN)</th>
                        <th className="pb-3 font-semibold text-center">Status</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reservations.slice(0, 5).map((r) => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-mono text-[#D5AD72]">{r.bookingRef}</td>
                          <td className="py-3 font-medium text-white">{r.fullName}</td>
                          <td className="py-3 text-white/70">{r.roomName}</td>
                          <td className="py-3 text-white/60 font-mono text-[11px]">
                            {r.checkIn} → {r.checkOut}
                          </td>
                          <td className="py-3 text-right font-mono text-white tabular-nums">
                            {formatNaira(r.total)}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.status === 'Confirmed'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : r.status === 'Pending'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-red-950 text-red-300 border border-red-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setActiveReservationModal(r)}
                              className="text-xs text-[#D5AD72] hover:underline cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: RESERVATIONS */}
          {/* ========================================================= */}
          {activeSection === 'reservations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Reservations Management
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Filter, search, confirm, or modify hotel suite bookings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handlePullFromSheet}
                    disabled={loadingReservations}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-xs font-medium cursor-pointer transition-colors"
                    title="Pull real-time bookings from Google Spreadsheet"
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 ${loadingReservations ? 'animate-spin' : ''}`} />
                    <span>Pull from Sheet</span>
                  </button>
                  {stats.pending > 0 && (
                    <button
                      onClick={handleConfirmAllPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D5AD72]/20 border border-[#D5AD72]/40 text-[#E4C38E] hover:bg-[#D5AD72]/30 text-xs font-medium cursor-pointer transition-colors"
                      title="Confirm all pending bookings at once"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm All ({stats.pending})</span>
                    </button>
                  )}
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setIsManualBookingOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Walk-In Reservation
                  </Button>
                  <Button
                    variant="outline-gold"
                    size="sm"
                    onClick={handleExportCSV}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Status and Google Sheets Notice Banner */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-[#D5AD72]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span>
                    New reservations arrive as <strong>"Pending"</strong> until confirmed. Click <strong>Pull from Sheet</strong> to sync your Google Sheet rows, or use <strong>(✓)</strong> on any reservation to confirm it.
                  </span>
                </div>
                <button
                  onClick={() => setShowCodeModal(true)}
                  className="text-xs text-[#D5AD72] hover:underline font-medium shrink-0 cursor-pointer"
                >
                  Apps Script Setup
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="p-4 rounded-xl bg-[#141A18] border border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search guest, ref, phone, suite..."
                    className="w-full h-10 pl-9 pr-4 bg-[#0D1110] border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:border-[#D5AD72] focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-white/40">Status:</span>
                  {['All', 'Pending', 'Confirmed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        statusFilter === st
                          ? 'bg-[#D5AD72] text-[#121615] font-semibold'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reservations Table */}
              <div className="bg-[#141A18] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#0F1413] text-white/50 uppercase tracking-wider text-[11px]">
                        <th className="p-4 font-semibold">Booking Ref</th>
                        <th className="p-4 font-semibold">Guest</th>
                        <th className="p-4 font-semibold">Reserved Suite</th>
                        <th className="p-4 font-semibold">Dates & Nights</th>
                        <th className="p-4 font-semibold">Guests</th>
                        <th className="p-4 font-semibold text-right">Total (NGN)</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredReservations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-10 text-center text-white/40">
                            No reservations matching current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredReservations.map((b) => (
                          <tr key={b.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-[#D5AD72]">{b.bookingRef}</td>
                            <td className="p-4">
                              <span className="font-semibold text-white block">{b.fullName}</span>
                              <span className="text-[11px] text-white/50">{b.phone}</span>
                            </td>
                            <td className="p-4 text-white/80">{b.roomName}</td>
                            <td className="p-4 font-mono text-[11px] text-white/60">
                              <div>{b.checkIn} → {b.checkOut}</div>
                              <span className="text-[10px] text-[#D5AD72]">{b.nights} {b.nights === 1 ? 'Night' : 'Nights'}</span>
                            </td>
                            <td className="p-4 text-white/70">
                              {b.adults} Adults{b.children ? `, ${b.children} Child` : ''}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-white tabular-nums">
                              {formatNaira(b.total)}
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  b.status === 'Confirmed'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : b.status === 'Pending'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-red-950 text-red-300 border border-red-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status === 'Pending' && (
                                  <button
                                    onClick={() => handleStatusChange(b.bookingRef, 'Confirmed')}
                                    title="Confirm Reservation"
                                    className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {b.status !== 'Cancelled' && (
                                  <button
                                    onClick={() => handleStatusChange(b.bookingRef, 'Cancelled')}
                                    title="Cancel / Reject Booking"
                                    className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 border border-red-800 cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setActiveReservationModal(b)}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D5AD72] font-semibold text-xs border border-white/10 cursor-pointer"
                                >
                                  Voucher
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: ROOM MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'rooms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Room & Suite Inventory
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Manage pricing in Nigerian Naira (₦), capacities, descriptions, and active availability.
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setIsAddRoomOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add New Room
                </Button>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomsList.map((room) => (
                  <div
                    key={room.RoomID}
                    className="rounded-2xl bg-[#141A18] border border-white/5 overflow-hidden shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                        <img
                          src={room.ImageURL || '/images/hotel/deluxe-1.jpg'}
                          alt={room.Name}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/images/hotel/deluxe-1.jpg';
                          }}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              room.Active
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            {room.Active ? 'Active' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#D5AD72] uppercase tracking-wider block">
                              {room.Type}
                            </span>
                            <h3 className="font-serif font-bold text-white text-base">
                              {room.Name}
                            </h3>
                          </div>
                          <span className="text-sm font-mono font-bold text-[#F3E5C8]">
                            {formatNaira(room.PricePerNight)} / night
                          </span>
                        </div>

                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {room.Description}
                        </p>

                        <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px] text-white/50 font-mono">
                          <span>Max {room.MaxGuests} Guests</span>
                          <span>·</span>
                          <span>{room.RoomSize || '38 m²'}</span>
                          <span>·</span>
                          <span>{room.BedType || '1 King Bed'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/5 bg-[#0F1413] flex items-center justify-between">
                      <button
                        onClick={() => handleToggleRoomActive(room.RoomID)}
                        className="text-xs text-white/70 hover:text-white underline cursor-pointer"
                      >
                        {room.Active ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => {
                          const newRate = prompt(`Enter new nightly rate in NGN for ${room.Name}:`, String(room.PricePerNight));
                          if (newRate && !isNaN(Number(newRate)) && Number(newRate) > 0) {
                            const updated = roomsList.map((r) =>
                              r.RoomID === room.RoomID ? { ...r, PricePerNight: Number(newRate) } : r
                            );
                            setRoomsList(updated);
                            localStorage.setItem('havenstay_admin_rooms', JSON.stringify(updated));
                            showToast(`Rate updated to ${formatNaira(Number(newRate))}`, 'success');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#D5AD72] text-[#121615] text-xs font-bold hover:bg-[#e0bb82] cursor-pointer"
                      >
                        Edit Rate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 4: GUEST MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'guests' && (
            <div className="space-y-6">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Guest Management & Profiles
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Directory of registered hotel guests, loyalty frequency, and cumulative expenditure.
                </p>
              </div>

              <div className="bg-[#141A18] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0F1413] text-white/50 uppercase tracking-wider text-[11px]">
                      <th className="p-4 font-semibold">Guest Name</th>
                      <th className="p-4 font-semibold">Contact Email</th>
                      <th className="p-4 font-semibold">Phone Number</th>
                      <th className="p-4 font-semibold text-center">Stays Booked</th>
                      <th className="p-4 font-semibold text-right">Total Spend (NGN)</th>
                      <th className="p-4 font-semibold text-right">Concierge Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {uniqueGuests.map(({ guest, count, spent }) => (
                      <tr key={guest.email} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#D5AD72]" />
                          <span>{guest.fullName}</span>
                        </td>
                        <td className="p-4 text-white/70 font-mono text-[11px]">{guest.email}</td>
                        <td className="p-4 text-white/70 font-mono text-[11px]">{guest.phone}</td>
                        <td className="p-4 text-center font-mono font-bold text-[#D5AD72]">{count}</td>
                        <td className="p-4 text-right font-mono font-bold text-white tabular-nums">
                          {formatNaira(spent)}
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 5: REVENUE AND REPORTS */}
          {/* ========================================================= */}
          {activeSection === 'revenue' && (
            <div className="space-y-6">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Revenue & Financial Reports
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Key hospitality metrics, Average Daily Rate (ADR), and revenue performance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#141A18] border border-[#D5AD72]/30 space-y-2">
                  <span className="text-xs text-white/50 block uppercase tracking-wider">Gross Confirmed Revenue</span>
                  <span className="text-3xl font-serif font-bold text-[#D5AD72] block">
                    {formatNaira(stats.totalRevenue)}
                  </span>
                  <span className="text-[11px] text-emerald-400">Live tally of all confirmed bookings</span>
                </div>

                <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-2">
                  <span className="text-xs text-white/50 block uppercase tracking-wider">Average Daily Rate (ADR)</span>
                  <span className="text-3xl font-serif font-bold text-white block">
                    {formatNaira(185000)}
                  </span>
                  <span className="text-[11px] text-white/40">Across luxury suite categories</span>
                </div>

                <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-2">
                  <span className="text-xs text-white/50 block uppercase tracking-wider">Estimated Monthly RevPAR</span>
                  <span className="text-3xl font-serif font-bold text-white block">
                    {formatNaira(Math.round(185000 * (stats.occupancyRate / 100)))}
                  </span>
                  <span className="text-[11px] text-[#D5AD72]">Based on current {stats.occupancyRate}% occupancy</span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                <h3 className="font-serif font-bold text-white text-base">Revenue by Suite Category</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Haven Premier Penthouse', share: '38%', amount: 790000 },
                    { name: 'Executive Suite', share: '32%', amount: 735000 },
                    { name: 'Deluxe King Room', share: '20%', amount: 495000 },
                    { name: 'Superior Double Room', share: '10%', amount: 435000 },
                  ].map((item) => (
                    <div key={item.name} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <div>
                        <span className="text-sm font-semibold text-white block">{item.name}</span>
                        <span className="text-[11px] text-[#D5AD72]">{item.share} of portfolio revenue</span>
                      </div>
                      <span className="font-mono font-bold text-white">{formatNaira(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 6: DINING MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'dining' && (
            <div className="space-y-6">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Culinary & Dining Venues Management
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Manage restaurant menus, dining hours, dress codes, and banquet services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {diningVenues.map((v) => (
                  <div key={v.id} className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D5AD72]/10 text-[#D5AD72] flex items-center justify-center">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-lg">{v.name}</h3>
                      <p className="text-xs text-white/60 mt-1">{v.tagline}</p>
                    </div>
                    <div className="space-y-1.5 text-xs text-white/50 border-t border-white/5 pt-3">
                      <div><strong>Hours:</strong> {v.hours}</div>
                      <div><strong>Dress Code:</strong> {v.dressCode}</div>
                      <div><strong>Active Dishes:</strong> {v.menuCount} items</div>
                    </div>
                    <Button
                      variant="outline-gold"
                      fullWidth
                      size="sm"
                      onClick={() => showToast(`Menu editor for ${v.name} opened`, 'info')}
                    >
                      Edit Menu & Prices
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 7: EVENTS AND OFFERS */}
          {/* ========================================================= */}
          {activeSection === 'events-offers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Events & Promotional Offers
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Manage banquet halls, seasonal promotions, and VIP weekend packages.
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    const title = prompt('Enter new promotional offer title:');
                    if (title) {
                      setOffersList([
                        ...offersList,
                        {
                          id: 'OFFER-' + (offersList.length + 1),
                          title,
                          badge: 'NEW',
                          validThrough: 'Dec 2026',
                          status: 'Active',
                          description: 'Special seasonal rate curated for discerning HavenStay guests.',
                        },
                      ]);
                      showToast('Promotional offer created', 'success');
                    }
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create New Offer
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offersList.map((offer) => (
                  <div key={offer.id} className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 rounded-full bg-[#D5AD72]/20 text-[#D5AD72] text-[10px] font-bold">
                        {offer.badge}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">{offer.status}</span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">{offer.title}</h3>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{offer.description}</p>
                    </div>
                    <div className="text-[11px] text-white/40 border-t border-white/5 pt-3">
                      Valid through: {offer.validThrough}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 8: GALLERY MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Visual Gallery & Media Assets
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Manage hotel photographs, suite viewports, and architecture photography.
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    const title = prompt('Enter photo title:');
                    const url = prompt('Enter image URL or relative path (/images/hotel/...):');
                    if (title && url) {
                      setGalleryPhotos([...galleryPhotos, { id: 'GAL-' + Date.now(), title, category: 'Suites', url }]);
                      showToast('Photo added to gallery', 'success');
                    }
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Photograph
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className="rounded-2xl bg-[#141A18] border border-white/5 overflow-hidden">
                    <div className="aspect-[4/3] bg-black/40 overflow-hidden">
                      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-[#D5AD72] uppercase font-mono block">{photo.category}</span>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">{photo.title}</h4>
                      </div>
                      <button
                        onClick={() => {
                          setGalleryPhotos(galleryPhotos.filter((p) => p.id !== photo.id));
                          showToast('Photograph removed', 'info');
                        }}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 9: WEBSITE CONTENT MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'website-content' && (
            <div className="space-y-6">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Website Content & Google Sheets Sync
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Manage public customer information, concierge contacts, and Google Spreadsheet synchronization.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Info Card */}
                <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                  <h3 className="font-serif font-bold text-white text-base">Public Concierge Contacts</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Hotel Telephone & Concierge</label>
                      <input
                        type="text"
                        value={contentSettings.phone}
                        onChange={(e) => setContentSettings({ ...contentSettings, phone: e.target.value })}
                        className="w-full h-10 px-3 bg-[#0D1110] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">WhatsApp Concierge</label>
                      <input
                        type="text"
                        value={contentSettings.whatsapp}
                        onChange={(e) => setContentSettings({ ...contentSettings, whatsapp: e.target.value })}
                        className="w-full h-10 px-3 bg-[#0D1110] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Executive Address</label>
                      <input
                        type="text"
                        value={contentSettings.address}
                        onChange={(e) => setContentSettings({ ...contentSettings, address: e.target.value })}
                        className="w-full h-10 px-3 bg-[#0D1110] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => showToast('Hotel public information saved', 'success')}
                    >
                      Save Public Details
                    </Button>
                  </div>
                </div>

                {/* Google Sheets Sync Diagnostics & Controls */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#141A18] border border-[#D5AD72]/40 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-white text-lg">Google Sheets Live Synchronization</h3>
                        <p className="text-xs text-white/60">
                          Direct bidirectional integration for bookings, guest records, and availability
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
                    >
                      <span>Open Live Spreadsheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Target Spreadsheet ID info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0D1110] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block">Target Spreadsheet ID</span>
                      <code className="text-xs font-mono text-[#D5AD72] break-all block select-all">
                        1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM
                      </code>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D1110] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block">Integration Method</span>
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Google Apps Script Web App (JSON / GET / POST)
                      </span>
                    </div>
                  </div>

                  {/* Active Google Apps Script URL Editor */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-white/80">
                      Google Apps Script Web App URL (/exec)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={appsScriptUrlInput}
                        onChange={(e) => setAppsScriptUrlInput(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 min-h-[42px] px-3.5 bg-[#0D1110] border border-white/10 rounded-lg text-xs font-mono text-white/90 focus:outline-none focus:border-[#D5AD72]"
                      />
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={handleSaveAppsScriptUrl}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save URL
                      </Button>
                    </div>
                    <p className="text-[11px] text-white/40">
                      If you redeploy a new version of the script in Google Apps Script, paste the updated URL here.
                    </p>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handlePingGoogleSheets}
                      loading={pingLoading}
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      {pingLoading ? 'Testing...' : 'Test Connection'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleTestBookingToSheet}
                      loading={testBookingLoading}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      {testBookingLoading ? 'Sending Test...' : 'Send Test Booking (HS-TEST)'}
                    </Button>

                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handleSyncAllToSheet}
                      loading={isSyncingSheet}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      {isSyncingSheet ? 'Syncing...' : 'Push All Reservations to Sheet'}
                    </Button>

                    <button
                      type="button"
                      onClick={handleCopyCodeGs}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Code.gs Copied!' : 'Copy Code.gs Script'}</span>
                    </button>
                  </div>

                  {/* Live Feedback / Result Cards */}
                  {pingResult && (
                    <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${pingResult.ok ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300' : 'bg-amber-950/70 border border-amber-500/30 text-amber-300'}`}>
                      {pingResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                      <div>
                        <span className="font-semibold block">{pingResult.ok ? 'Connection Verified' : 'Connection Notice'}</span>
                        <span>{pingResult.message}</span>
                      </div>
                    </div>
                  )}

                  {syncSheetResult && (
                    <div className="p-4 rounded-xl text-xs bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Synchronization Status</span>
                        <span>{syncSheetResult}</span>
                      </div>
                    </div>
                  )}

                  {/* Helpful Quick Guide */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 text-xs text-white/70">
                    <span className="font-semibold text-white block">Why reservations might not appear immediately:</span>
                    <ol className="list-decimal list-inside space-y-1 text-white/60 text-[11px] leading-relaxed">
                      <li>In Google Sheets, open your spreadsheet <code className="text-[#D5AD72]">1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM</code>.</li>
                      <li>Click top menu: <strong className="text-white">Extensions</strong> → <strong className="text-white">Apps Script</strong>.</li>
                      <li>Delete all existing text in the editor, click <strong className="text-[#D5AD72]">Copy Code.gs Script</strong> above, and paste it into the editor.</li>
                      <li>Click <strong className="text-white">Deploy</strong> (top right) → <strong className="text-white">New deployment</strong> → select <strong className="text-white">Web app</strong> → set Access to <strong className="text-white">"Anyone"</strong> → click <strong className="text-white">Deploy</strong>.</li>
                      <li>Copy the Web App URL that Google gives you, paste it into the URL field above, and click <strong className="text-[#D5AD72]">Save URL</strong>!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 10: SETTINGS */}
          {/* ========================================================= */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-serif font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  System & Administrator Settings
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Manage administrator credentials, hotel staff roles, and security policies.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                  <h3 className="font-serif font-bold text-white text-base">Executive Profile</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-white/40 block">Designated Administrator:</span>
                      <span className="font-semibold text-white">Danny Egutu</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Email Address:</span>
                      <span className="font-mono text-[#D5AD72]">egutudanny6@gmail.com</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Assigned Security Role:</span>
                      <span className="font-semibold text-emerald-400">Super Administrator (Full Operational Authority)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#141A18] border border-white/5 space-y-4">
                  <h3 className="font-serif font-bold text-white text-base">Security Credentials & Keys</h3>
                  <div className="space-y-3">
                    <p className="text-xs text-white/60 leading-relaxed">
                      To modify the master administrator credentials or generate dedicated staff API tokens, contact HavenStay Security Engineering.
                    </p>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-white/70">
                      <span>Direct Emergency Contact: <strong>+234 907 577 2701</strong></span>
                    </div>
                    <Button
                      variant="outline-gold"
                      size="sm"
                      onClick={() => showToast('Credential audit log requested', 'info')}
                    >
                      Audit Active Terminal Sessions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DETAIL VOUCHER MODAL */}
      <AnimatePresence>
        {activeReservationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReservationModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#181D1C] border border-[#D5AD72]/40 rounded-2xl shadow-2xl z-10 overflow-hidden my-6"
            >
              <div className="p-6 bg-gradient-to-r from-[#121615] via-[#1A2320] to-[#121615] border-b border-[#D5AD72]/30 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-white text-lg">HavenStay Reservation Voucher</h3>
                  <span className="text-xs font-mono text-[#D5AD72]">Ref: {activeReservationModal.bookingRef}</span>
                </div>
                <button
                  onClick={() => setActiveReservationModal(null)}
                  className="p-1 rounded-full text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs sm:text-sm text-white/80">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[11px] text-white/40 block">Guest Name</span>
                    <span className="font-bold text-white text-base">{activeReservationModal.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 block">Status</span>
                    <span className="font-bold text-emerald-400">{activeReservationModal.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Phone:</span>
                    <span className="font-medium text-white">{activeReservationModal.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Email:</span>
                    <span className="font-medium text-white">{activeReservationModal.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Suite:</span>
                    <span className="font-medium text-[#D5AD72]">{activeReservationModal.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Dates:</span>
                    <span className="font-mono text-white">{activeReservationModal.checkIn} → {activeReservationModal.checkOut} ({activeReservationModal.nights} Nights)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Payment:</span>
                    <span className="font-medium text-white">{activeReservationModal.paymentPref}</span>
                  </div>
                </div>

                {activeReservationModal.requests && (
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[11px] text-[#D5AD72] font-semibold block">Special Requests</span>
                    <p className="text-xs text-white/70 mt-0.5">{activeReservationModal.requests}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total Amount:</span>
                  <span className="text-2xl font-serif font-bold text-[#F3E5C8]">
                    {formatNaira(activeReservationModal.total)}
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://wa.me/${activeReservationModal.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${activeReservationModal.fullName}, HavenStay Hotels concierge here regarding your reservation ${activeReservationModal.bookingRef} for ${activeReservationModal.roomName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#20ba59]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Guest</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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

      {/* WALK-IN MODAL */}
      <AnimatePresence>
        {isManualBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualBookingOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#181D1C] border border-[#D5AD72]/40 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif font-bold text-white text-lg">New Walk-In Reservation</h3>
                <button
                  onClick={() => setIsManualBookingOpen(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWalkIn} className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Select Suite</label>
                  <select
                    value={manualForm.roomId}
                    onChange={(e) => setManualForm({ ...manualForm, roomId: e.target.value })}
                    className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                  >
                    {roomsList.map((r) => (
                      <option key={r.RoomID} value={r.RoomID}>
                        {r.Name} ({formatNaira(r.PricePerNight)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Check-In</label>
                    <input
                      type="date"
                      value={manualForm.checkIn}
                      onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                      className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Check-Out</label>
                    <input
                      type="date"
                      value={manualForm.checkOut}
                      onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                      className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={manualForm.fullName}
                    onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                    className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="gold" fullWidth>
                    Confirm Walk-In Booking
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD ROOM MODAL */}
      <AnimatePresence>
        {isAddRoomOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddRoomOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#181D1C] border border-[#D5AD72]/40 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif font-bold text-white text-lg">Add Suite to Inventory</h3>
                <button
                  onClick={() => setIsAddRoomOpen(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRoom} className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Suite Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Horizon Suite"
                    value={newRoomForm.Name}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, Name: e.target.value })}
                    className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Category</label>
                    <select
                      value={newRoomForm.Type}
                      onChange={(e) => setNewRoomForm({ ...newRoomForm, Type: e.target.value as any })}
                      className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                    >
                      <option value="Deluxe">Deluxe</option>
                      <option value="Executive Suite">Executive Suite</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Superior">Superior</option>
                      <option value="Family Suite">Family Suite</option>
                      <option value="Classic">Classic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Nightly Rate (NGN)</label>
                    <input
                      type="number"
                      required
                      value={newRoomForm.PricePerNight}
                      onChange={(e) => setNewRoomForm({ ...newRoomForm, PricePerNight: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1">Image URL or Local Path</label>
                  <input
                    type="text"
                    value={newRoomForm.ImageURL}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, ImageURL: e.target.value })}
                    className="w-full h-10 px-3 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newRoomForm.Description}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, Description: e.target.value })}
                    className="w-full p-2.5 bg-[#121615] border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="gold" fullWidth>
                    Save Suite to Inventory
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GOOGLE APPS SCRIPT SETUP MODAL */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCodeModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#141A18] border border-[#D5AD72]/40 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-lg">
                      Sync Google Sheet with Admin Dashboard
                    </h3>
                    <p className="text-xs text-white/60">
                      Your 21 bookings are saved in your Google Sheet. Follow these 4 quick steps to stream them into Netlify:
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3.5 text-xs text-white/80">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#D5AD72] text-[#121615] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-white block">Open your Google Sheet</span>
                    <p className="text-[11px] text-white/60 mt-0.5">
                      Open your target spreadsheet ID: <code className="text-[#D5AD72]">1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM</code>
                    </p>
                    <a
                      href="https://docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-medium text-[11px] mt-1.5"
                    >
                      <span>Open Spreadsheet in New Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#D5AD72] text-[#121615] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white block">Open Apps Script Editor</span>
                    <p className="text-[11px] text-white/60 mt-0.5">
                      In the Google Sheets top menu bar, click <strong className="text-white">Extensions</strong> → <strong className="text-white">Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#D5AD72] text-[#121615] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1 space-y-2">
                    <span className="font-semibold text-white block">Replace code with updated script</span>
                    <p className="text-[11px] text-white/60">
                      In the editor, select all existing text, delete it, and paste this updated script. Then click the <strong className="text-white">Save</strong> (💾) icon.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyCodeGs}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedScript ? 'Code.gs Copied to Clipboard!' : 'Copy Code.gs Script'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#D5AD72] text-[#121615] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <span className="font-semibold text-white block">Deploy New Version</span>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                      Click the blue <strong className="text-white">Deploy</strong> button (top right) → <strong className="text-white">Manage deployments</strong> → click the <strong className="text-white">Pencil (Edit)</strong> icon → choose <strong className="text-white">Version: "New version"</strong> → click <strong className="text-white">Deploy</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[11px] text-white/50">
                  After deploying, click <strong>"Pull from Sheet"</strong> to load all 21 bookings.
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setShowCodeModal(false)}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
