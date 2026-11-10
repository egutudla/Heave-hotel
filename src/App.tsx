import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, SearchParams } from './types';
import { fetchRooms } from './config/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastProvider } from './components/Toast';
import { RoomDetailModal } from './components/RoomDetailModal';
import { BookingModal } from './components/BookingModal';
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { DiningPage } from './pages/DiningPage';
import { PoolBarPage } from './pages/PoolBarPage';
import { EventsPage } from './pages/EventsPage';
import { OffersPage } from './pages/OffersPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPortalApp } from './admin-portal/AdminPortalApp';

export type PublicPage =
  | 'home'
  | 'rooms'
  | 'dining'
  | 'pool-bar'
  | 'events'
  | 'offers'
  | 'gallery'
  | 'about'
  | 'contact';

/**
 * Architectural Domain & Route Routing:
 * Detects whether the visitor is accessing the dedicated HAVENSTAY MANAGEMENT PORTAL
 * (e.g. manage.havenstayhotels.com or /admin / /portal routes)
 * or the customer-facing luxury hotel website.
 */
function isManagementPortalRoute(): boolean {
  try {
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);

    // Intended production hostname: manage.havenstayhotels.com (or subdomains starting with manage.)
    if (host.startsWith('manage.') || host.includes('manage.havenstayhotels.com')) {
      return true;
    }

    // Direct independent management routes in dev/preview
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/management') ||
      search.get('portal') === 'admin' ||
      search.get('app') === 'admin'
    ) {
      return true;
    }
  } catch {}
  return false;
}

function getInitialPublicPage(): PublicPage {
  try {
    const pathname = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const pageParam = search.get('page');

    if (pathname.includes('/rooms') || pageParam === 'rooms') return 'rooms';
    if (pathname.includes('/dining') || pageParam === 'dining') return 'dining';
    if (pathname.includes('/pool-bar') || pageParam === 'pool-bar') return 'pool-bar';
    if (pathname.includes('/events') || pageParam === 'events') return 'events';
    if (pathname.includes('/offers') || pageParam === 'offers') return 'offers';
    if (pathname.includes('/gallery') || pageParam === 'gallery') return 'gallery';
    if (pathname.includes('/about') || pageParam === 'about') return 'about';
    if (pathname.includes('/contact') || pageParam === 'contact') return 'contact';
  } catch {}
  return 'home';
}

function getPathForPublicPage(page: PublicPage): string {
  switch (page) {
    case 'home':
      return '/';
    case 'rooms':
      return '/rooms';
    case 'dining':
      return '/dining';
    case 'pool-bar':
      return '/pool-bar';
    case 'events':
      return '/events';
    case 'offers':
      return '/offers';
    case 'gallery':
      return '/gallery';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    default:
      return '/';
  }
}

/**
 * CUSTOMER-FACING APPLICATION: HAVENSTAY HOTELS
 * Contains absolutely zero references to admin or staff portals.
 */
function CustomerWebsiteApp() {
  const [activePage, setActivePage] = useState<PublicPage>(() => getInitialPublicPage());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  // Search parameters
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    roomsCount: 1,
  });

  // Modals state
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Synchronize browser history / popstate for customer navigation
  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPublicPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch rooms on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingRooms(true);
        const data = await fetchRooms();
        if (isMounted) {
          setRooms(data);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        if (isMounted) {
          setLoadingRooms(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (page: string) => {
    const targetPage = page as PublicPage;
    setActivePage(targetPage);
    const targetPath = getPathForPublicPage(targetPage);

    try {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page: targetPage }, '', targetPath);
      }
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: SearchParams) => {
    setSearchParams(params);
    handleNavigate('rooms');
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoomForDetail(room);
    setDetailModalOpen(true);
  };

  const handleReserve = (room: Room) => {
    setSelectedRoomForBooking(room);
    setBookingModalOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setSelectedRoomForBooking(rooms[0] || null);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#242424] font-sans antialiased selection:bg-[#D5AD72] selection:text-[#142D26]">
      {/* 1. Customer Navigation Bar - Strictly customer links, NO admin references */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenGeneralBooking}
        forceSolid={activePage !== 'home'}
      />

      {/* Main Public Website Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <HomePage
                rooms={rooms}
                onSearch={handleHeroSearch}
                onViewDetails={handleViewDetails}
                onReserve={handleReserve}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activePage === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <RoomsPage
                rooms={rooms}
                loading={loadingRooms}
                searchParams={searchParams}
                onSearchChange={setSearchParams}
                onViewDetails={handleViewDetails}
                onReserve={handleReserve}
              />
            </motion.div>
          )}

          {activePage === 'dining' && (
            <motion.div
              key="dining"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <DiningPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}

          {activePage === 'pool-bar' && (
            <motion.div
              key="pool-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <PoolBarPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}

          {activePage === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <EventsPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}

          {activePage === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <OffersPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}

          {activePage === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <GalleryPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}

          {activePage === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}

          {activePage === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <ContactPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 2. Customer Footer - Strictly customer information, NO admin references */}
      <Footer
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenGeneralBooking}
      />

      {/* Modals & Dialogs */}
      <RoomDetailModal
        room={selectedRoomForDetail}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onReserve={(room) => {
          setSelectedRoomForBooking(room);
          setBookingModalOpen(true);
        }}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedRoomForBooking(null);
        }}
        onBookingSuccess={() => {
          // Reset search and selection state to clean defaults after booking
          setSearchParams({
            checkIn: '',
            checkOut: '',
            adults: 1,
            children: 0,
            roomsCount: 1,
          });
        }}
        selectedRoom={selectedRoomForBooking}
        allRooms={rooms}
        searchParams={searchParams}
      />
    </div>
  );
}

/**
 * Top-Level App Entry:
 * Routes between HavenStay Management Portal and Customer Website
 */
export default function App() {
  const isPortal = isManagementPortalRoute();

  if (isPortal) {
    return <AdminPortalApp />;
  }

  return (
    <ToastProvider>
      <CustomerWebsiteApp />
    </ToastProvider>
  );
}
