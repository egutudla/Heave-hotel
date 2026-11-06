import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, SearchParams, BookingFormData, BookingResult } from './types';
import { fetchRooms } from './config/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './components/Toast';
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

function HavenStayApp() {
  const [activePage, setActivePage] = useState<
    'home' | 'rooms' | 'dining' | 'pool-bar' | 'events' | 'offers' | 'gallery' | 'about' | 'contact'
  >('home');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  // Search parameters persisted across views
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkIn: tomorrow.toISOString().split('T')[0],
    checkOut: dayAfter.toISOString().split('T')[0],
    adults: 2,
    children: 0,
  });

  // Modals state
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

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

  // Handlers
  const handleNavigate = (page: string) => {
    setActivePage(page as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: SearchParams) => {
    setSearchParams(params);
    setActivePage('rooms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* 1. Sticky Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenGeneralBooking}
        forceSolid={activePage !== 'home'}
      />

      {/* Main Page Content with Soft Fade Route Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
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
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <ContactPage
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenGeneralBooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 11. Footer */}
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
        onClose={() => setBookingModalOpen(false)}
        selectedRoom={selectedRoomForBooking}
        allRooms={rooms}
        searchParams={searchParams}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <HavenStayApp />
    </ToastProvider>
  );
}
