import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Eye, X, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { ScrollReveal } from '../components/ScrollReveal';

interface GalleryPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'rooms' | 'dining' | 'pool' | 'spaces';
  type: 'video' | 'image';
  videoUrl?: string;
  imageUrl: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Haven Grand Architectural Lobby',
    category: 'spaces',
    type: 'video',
    videoUrl: '/videos/hotel-tour.mp4',
    imageUrl: '/videos/hotel-tour.jpg',
    description: 'Soaring double-height ceilings, warm travertine stone, and ambient bronze lighting.',
  },
  {
    id: 'g-2',
    title: 'Deluxe King Suite Sanctuary',
    category: 'rooms',
    type: 'video',
    videoUrl: '/videos/rooms-suites.mp4',
    imageUrl: '/videos/rooms-suites.jpg',
    description: 'Morning sunlight across 400-thread Egyptian cotton bedding and private balcony.',
  },
  {
    id: 'g-3',
    title: 'Azure Heated Lap Pool & Cabanas',
    category: 'pool',
    type: 'video',
    videoUrl: '/videos/swimming-pool.mp4',
    imageUrl: '/videos/swimming-pool.jpg',
    description: 'Temperature-controlled lap pool surrounded by private plush sun loungers.',
  },
  {
    id: 'g-4',
    title: 'Sofia Restaurant Fine Dining',
    category: 'dining',
    type: 'video',
    videoUrl: '/videos/restaurant-dining.mp4',
    imageUrl: '/videos/restaurant-dining.jpg',
    description: 'Fresh seasonal culinary creations prepared by our executive chef brigade.',
  },
  {
    id: 'g-5',
    title: 'Sunset Bar Mixology',
    category: 'dining',
    type: 'video',
    videoUrl: '/videos/cocktail-bar.mp4',
    imageUrl: '/videos/cocktail-bar.jpg',
    description: 'Artisan hand-shaken cocktails, vintage cellars, and relaxed evening conversations.',
  },
  {
    id: 'g-6',
    title: 'Wellness & Fitness Studio',
    category: 'spaces',
    type: 'video',
    videoUrl: '/videos/gym-fitness.mp4',
    imageUrl: '/videos/gym-fitness.jpg',
    description: '24-hour cardio and strength training equipment with complimentary chilled water.',
  },
  {
    id: 'g-7',
    title: 'Executive Master Bath & Soaking Tub',
    category: 'rooms',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    description: 'Freestanding soaking tubs, dual vanities, and botanical bath amenities.',
  },
  {
    id: 'g-8',
    title: 'Penthouse Sunset Terrace',
    category: 'rooms',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    description: 'Expansive private outdoor terrace with panoramic cityscape vistas.',
  },
  {
    id: 'g-9',
    title: 'Artisan Breakfast Table',
    category: 'dining',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm French pastries, organic farm eggs, and fresh tropical fruit juices.',
  },
];

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate, onOpenBooking }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'rooms' | 'dining' | 'pool' | 'spaces'>('all');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <div className="w-full pb-24">
      {/* Hero Banner with Full Tour Video */}
      <section className="relative min-h-[50vh] sm:min-h-[58vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/hotel-tour.jpg"
            className="w-full h-full object-cover origin-center opacity-65 filter brightness-85 transform-gpu"
          >
            <source src="/videos/hotel-tour.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/60 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-white/70 mb-3"
          >
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#D5AD72] transition-colors cursor-pointer"
            >
              HOME
            </button>
            <span className="text-[#D5AD72]">—</span>
            <span className="text-[#D5AD72]">HOTEL VISUAL GALLERY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Visual & Video{' '}
            <span
              className="text-[#E4C38E] italic font-serif font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Gallery
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl font-light leading-relaxed"
          >
            Experience our guest rooms, pools, restaurants, and lounges in vivid clarity through cinematic clips and imagery.
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-center gap-2 flex-wrap pb-8 border-b border-[#D5AD72]/20">
          {[
            { id: 'all', label: 'All Spaces' },
            { id: 'rooms', label: 'Rooms & Suites' },
            { id: 'dining', label: 'Dining & Bars' },
            { id: 'pool', label: 'Pool & Cabanas' },
            { id: 'spaces', label: 'Lobby & Wellness' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#142D26] text-white shadow-sm'
                  : 'bg-white text-[#242424] border border-[#D5AD72]/40 hover:bg-[#F7F5F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: idx * 0.06 }}
                onClick={() => setActiveModalItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-white border border-[#D5AD72]/30 shadow-xs cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-[#0D1F1A]">
                  {item.type === 'video' && item.videoUrl ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={item.imageUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    >
                      <source src={item.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {item.type === 'video' && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white flex items-center gap-1.5 border border-white/20">
                      <Play className="w-2.5 h-2.5 text-[#D5AD72] fill-current" />
                      <span>Video Loop</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D5AD72] block mb-1">
                      {item.category.toUpperCase()}
                    </span>
                    <h3
                      className="font-serif font-bold text-lg text-white"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox / Video Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalItem(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-4xl bg-[#0D1F1A] rounded-2xl overflow-hidden border border-[#D5AD72]/40 shadow-2xl"
            >
              <div className="relative aspect-[16/9] w-full bg-black">
                {activeModalItem.type === 'video' && activeModalItem.videoUrl ? (
                  <video
                    autoPlay
                    loop
                    controls
                    playsInline
                    poster={activeModalItem.imageUrl}
                    className="w-full h-full object-cover"
                  >
                    <source src={activeModalItem.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={activeModalItem.imageUrl}
                    alt={activeModalItem.title}
                    className="w-full h-full object-contain"
                  />
                )}
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:text-[#D5AD72] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3
                    className="text-xl font-serif font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {activeModalItem.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-1 max-w-lg">
                    {activeModalItem.description}
                  </p>
                </div>
                <Button variant="gold" size="sm" onClick={onOpenBooking}>
                  Reserve This Experience
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
