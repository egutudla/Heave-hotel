import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  Maximize2,
  Check,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Room } from '../types';
import { Button } from './Button';

interface RoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onReserve: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  onReserve,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!room || !isOpen) return null;

  const allImages = [
    room.ImageURL,
    ...(room.AdditionalImages || []),
  ].filter(Boolean);

  const amenityList = room.Amenities
    ? room.Amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#142D26]/75 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-[0_24px_60px_rgba(20,45,38,0.25)] border border-[#D5AD72]/40 z-10 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F7F5F0] bg-[#F7F5F0]">
            <div>
              <span className="text-xs font-semibold text-[#B88E52] uppercase tracking-wider">
                {room.Type}
              </span>
              <h3
                className="text-xl sm:text-2xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {room.Name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#575757] hover:text-[#142D26] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Gallery with Smooth Crossfade & Lightbox button */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-[#ECE8DE] group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={allImages[activeImageIndex]}
                    alt={`${room.Name} view ${activeImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Lightbox trigger */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-[#142D26] px-3 py-1.5 rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge Photos</span>
                </button>

                {/* Left/Right controls if multiple images */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activeImageIndex
                          ? 'border-[#D5AD72] scale-102 shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Bar (Unboxed clean metadata) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F7F5F0] border border-[#D5AD72]/20">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#575757]">
                  Capacity
                </span>
                <span className="text-sm font-semibold text-[#142D26]">
                  Up to {room.MaxGuests} Guests
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#575757]">
                  Bed Configuration
                </span>
                <span className="text-sm font-semibold text-[#142D26]">
                  {room.BedType || 'King Bed'}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#575757]">
                  Room Space
                </span>
                <span className="text-sm font-semibold text-[#142D26]">
                  {room.RoomSize || '38 m² / 409 sq ft'}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#575757]">
                  Nightly Rate
                </span>
                <span className="text-base font-serif font-bold text-[#142D26]">
                  ${room.PricePerNight} <span className="text-xs font-normal text-[#575757]">/ night</span>
                </span>
              </div>
            </div>

            {/* Room Story / Description */}
            <div className="space-y-3">
              <h4
                className="text-lg font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Room Overview
              </h4>
              <p className="text-sm text-[#242424]/85 leading-relaxed">
                {room.Description}
              </p>
            </div>

            {/* Facilities & Amenities */}
            <div className="space-y-3">
              <h4
                className="text-lg font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Amenities & In-Room Comforts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {amenityList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-[#D5AD72]/20 text-xs sm:text-sm text-[#242424]"
                  >
                    <Check className="w-4 h-4 text-[#B88E52] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HavenStay Direct Guarantee */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#142D26]/5 border border-[#142D26]/10 text-xs text-[#242424]/80">
              <ShieldCheck className="w-5 h-5 text-[#142D26] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#142D26] block">
                  Best Rate Guaranteed & Flexible Cancellation
                </span>
                <span>
                  Reserve directly with HavenStay Hotels for transparent pricing, live instant reservation, and zero hidden surcharge fees.
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-t border-[#F7F5F0] bg-[#F7F5F0]">
            <div>
              <span className="text-xs text-[#575757] block">Standard Nightly Rate</span>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-xl sm:text-2xl font-serif font-bold text-[#142D26]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  ${room.PricePerNight}
                </span>
                <span className="text-xs text-[#575757]">/ night</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  onClose();
                  onReserve(room);
                }}
                icon={<Calendar className="w-4 h-4" />}
              >
                Reserve Now
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox for Full-Scale Image Preview */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl w-full z-10"
            >
              <img
                src={allImages[activeImageIndex]}
                alt="Enlarged room view"
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
