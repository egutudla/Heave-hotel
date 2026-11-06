import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  Filter,
  Check,
  Calendar,
  X,
  Users,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Room, SearchParams } from '../types';
import { RoomCard } from '../components/RoomCard';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { ScrollReveal } from '../components/ScrollReveal';
import { formatNaira } from '../utils/currency';

interface RoomsPageProps {
  rooms: Room[];
  loading: boolean;
  searchParams: SearchParams;
  onSearchChange: (params: SearchParams) => void;
  onViewDetails: (room: Room) => void;
  onReserve: (room: Room) => void;
  onNavigate?: (page: string) => void;
}

const ROOM_TYPES = [
  'All Types',
  'Deluxe',
  'Executive Suite',
  'Penthouse',
  'Superior',
  'Family Suite',
  'Classic',
];

const AVAILABLE_AMENITY_FILTERS = [
  'Wi-Fi',
  'Air conditioning',
  'King-size bed',
  'Balcony',
  'City view',
  'Bathtub',
  'Kitchenette',
];

export const RoomsPage: React.FC<RoomsPageProps> = ({
  rooms,
  loading,
  searchParams,
  onSearchChange,
  onViewDetails,
  onReserve,
  onNavigate,
}) => {
  // Filter States
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [minGuests, setMinGuests] = useState<number>(searchParams.adults || 1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedType('All Types');
    setMaxPrice(500000);
    setMinGuests(1);
    setSelectedAmenities([]);
    setSortBy('default');
  };

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // Room type filter
        if (selectedType !== 'All Types' && room.Type !== selectedType) {
          return false;
        }

        // Max price filter
        if (room.PricePerNight > maxPrice) {
          return false;
        }

        // Guests capacity filter
        if (room.MaxGuests < minGuests) {
          return false;
        }

        // Amenities filter
        if (selectedAmenities.length > 0) {
          const roomAmenitiesLower = room.Amenities.toLowerCase();
          const hasAll = selectedAmenities.every((a) =>
            roomAmenitiesLower.includes(a.toLowerCase())
          );
          if (!hasAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.PricePerNight - b.PricePerNight;
        if (sortBy === 'price-desc') return b.PricePerNight - a.PricePerNight;
        return 0;
      });
  }, [rooms, selectedType, maxPrice, minGuests, selectedAmenities, sortBy]);

  const activeFilterCount =
    (selectedType !== 'All Types' ? 1 : 0) +
    (maxPrice < 500000 ? 1 : 0) +
    (minGuests > 1 ? 1 : 0) +
    selectedAmenities.length;

  return (
    <div className="w-full pb-24">
      {/* 
        Hero Banner styled after the reference image:
        - Rich dark moody hotel bedroom photography
        - Breadcrumb: HOME — ROOMS & SUITES
        - Heading: Rooms & Suites (with "Suites" in warm gold italic)
        - Subtext: Quiet retreats designed for deep rest...
      */}
      <section className="relative min-h-[55vh] sm:min-h-[62vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        {/* Full-width luxury bedroom background video with Ken Burns zoom */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/rooms-suites.jpg"
            className="w-full h-full object-cover origin-center opacity-70 filter brightness-90 transform-gpu"
          >
            <source
              src="/videos/rooms-suites.mp4"
              type="video/mp4"
            />
            {/* Fallback image */}
            <img
              src="/videos/rooms-suites.jpg"
              alt="HavenStay Luxury Bedroom & Suites"
              className="w-full h-full object-cover origin-center opacity-65 transform-gpu"
            />
          </video>
          {/* Subtle dark vignette & bottom gradient to blend into page */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/65 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Hero Content with Slow Staggered Reveal */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-left sm:text-center flex flex-col items-start sm:items-center">
          {/* Breadcrumb: HOME — ROOMS & SUITES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-white/70 mb-4"
          >
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="hover:text-[#D5AD72] transition-colors cursor-pointer"
            >
              HOME
            </button>
            <span className="text-[#D5AD72]">—</span>
            <span className="text-[#D5AD72]">ROOMS & SUITES</span>
          </motion.div>

          {/* Title: Rooms & Suites */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Rooms &{' '}
            <span
              className="text-[#E4C38E] italic font-serif font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Suites
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl font-light leading-relaxed"
          >
            Quiet retreats designed for deep rest — each space beautifully finished and ready to welcome you home.
          </motion.p>
        </div>
      </section>

      {/* Floating Date Search Bar with Smooth Scroll Reveal */}
      <ScrollReveal yOffset={30} delay={0.1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <SearchBar
          initialValues={searchParams}
          onSearch={(params) => {
            onSearchChange(params);
            setMinGuests(params.adults);
          }}
          isFloating={false}
        />
      </ScrollReveal>

      {/* Main Filter & Rooms Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Top Control Bar: Results count, Mobile filter button, Sort dropdown */}
        <ScrollReveal yOffset={25} delay={0.15}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-[#D5AD72]/20 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg sm:text-xl font-serif font-bold text-[#142D26]">
                {loading ? 'Searching rooms...' : `${filteredRooms.length} Rooms Available`}
              </span>
              {activeFilterCount > 0 && (
                <span className="text-xs text-[#575757]">
                  ({activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#D5AD72]/40 text-xs font-medium text-[#142D26] shadow-xs cursor-pointer hover:bg-[#F7F5F0] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E52]" />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#575757] hidden sm:inline font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3.5 bg-white border border-[#D5AD72]/40 rounded-lg text-xs font-medium text-[#142D26] focus:outline-none focus:ring-2 focus:ring-[#D5AD72] cursor-pointer shadow-xs"
                >
                  <option value="default">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Content Columns: Desktop Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols) with Slow Reveal */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28">
            <ScrollReveal yOffset={35} delay={0.2} duration={0.85}>
              <div className="bg-white rounded-xl p-6 border border-[#D5AD72]/30 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#F7F5F0]">
                  <span className="font-serif font-bold text-sm text-[#142D26] uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#B88E52]" />
                    Filter Stays
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-[#B88E52] hover:text-[#142D26] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Room Type Segmented Buttons */}
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-3">
                    Room Category
                  </span>
                  <div className="space-y-1">
                    {ROOM_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          selectedType === type
                            ? 'bg-[#142D26] text-white'
                            : 'text-[#242424] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        <span>{type}</span>
                        {selectedType === type && <Check className="w-3.5 h-3.5 text-[#D5AD72]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#142D26]">
                      Max Price / Night
                    </span>
                    <span className="text-xs font-bold text-[#142D26]">{formatNaira(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={500000}
                    step={10000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#142D26] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#575757] mt-1">
                    <span>₦100,000</span>
                    <span>₦500,000+</span>
                  </div>
                </div>

                {/* Minimum Guests Required */}
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-2.5">
                    Guests Accommodated
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMinGuests(num)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          minGuests === num
                            ? 'bg-[#142D26] text-white border-[#142D26]'
                            : 'bg-[#F7F5F0] text-[#242424] border-[#D5AD72]/30 hover:border-[#D5AD72]'
                        }`}
                      >
                        {num}{num === 4 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities Checkboxes */}
                <div className="pt-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-3">
                    Features & Amenities
                  </span>
                  <div className="space-y-2">
                    {AVAILABLE_AMENITY_FILTERS.map((amenity) => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <label
                          key={amenity}
                          className="flex items-center gap-2.5 text-xs text-[#242424] cursor-pointer select-none group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAmenity(amenity)}
                            className="h-4 w-4 rounded border-[#D5AD72] text-[#142D26] focus:ring-[#D5AD72]"
                          />
                          <span className="group-hover:text-[#142D26] transition-colors">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </aside>

          {/* Rooms Grid (9 cols) */}
          <main className="lg:col-span-9">
            {loading ? (
              /* Skeleton Loader State */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-xl overflow-hidden border border-[#D5AD72]/20 shadow-xs animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-[#ECE8DE]" />
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-[#ECE8DE] rounded-sm w-1/3" />
                      <div className="h-6 bg-[#ECE8DE] rounded-sm w-3/4" />
                      <div className="space-y-2">
                        <div className="h-3 bg-[#ECE8DE] rounded-sm w-full" />
                        <div className="h-3 bg-[#ECE8DE] rounded-sm w-5/6" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="h-10 bg-[#ECE8DE] rounded-md" />
                        <div className="h-10 bg-[#ECE8DE] rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              /* Empty State */
              <ScrollReveal yOffset={25}>
                <div className="text-center py-16 px-6 bg-white rounded-xl border border-[#D5AD72]/30 max-w-lg mx-auto space-y-4 shadow-sm">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#B88E52]">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3
                    className="text-xl font-serif font-bold text-[#142D26]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    No Rooms Match Your Selected Criteria
                  </h3>
                  <p className="text-xs sm:text-sm text-[#575757] leading-relaxed">
                    We could not find rooms matching your current filter settings. Try adjusting your dates, budget, or resetting filters.
                  </p>
                  <div className="pt-2">
                    <Button variant="secondary" size="md" onClick={resetFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            ) : (
              /* Animated Room Cards Grid with Slow Scroll Rise */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredRooms.map((room, idx) => (
                    <motion.div
                      key={room.RoomID}
                      initial={{ opacity: 0, y: 36 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{
                        duration: 0.85,
                        delay: (idx % 2) * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <RoomCard
                        room={room}
                        index={idx}
                        onViewDetails={onViewDetails}
                        onReserve={onReserve}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-[#142D26]/60 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]">
                  <h3
                    className="font-serif font-bold text-lg text-[#142D26]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Filter Rooms
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 rounded-full text-[#575757] hover:text-[#142D26]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Type Filter */}
                <div>
                  <span className="block text-xs font-semibold uppercase text-[#142D26] mb-2">
                    Room Category
                  </span>
                  <div className="space-y-1">
                    {ROOM_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                          selectedType === type
                            ? 'bg-[#142D26] text-white'
                            : 'text-[#242424] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-[#142D26]">Max Nightly Rate</span>
                    <span className="font-bold text-[#142D26]">{formatNaira(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={500000}
                    step={10000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#142D26]"
                  />
                  <div className="flex justify-between text-[11px] text-[#575757] mt-1">
                    <span>₦100,000</span>
                    <span>₦500,000+</span>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <span className="block text-xs font-semibold uppercase text-[#142D26] mb-2">
                    Minimum Guests
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMinGuests(num)}
                        className={`py-2 text-xs font-medium rounded-lg border ${
                          minGuests === num
                            ? 'bg-[#142D26] text-white border-[#142D26]'
                            : 'bg-[#F7F5F0] text-[#242424] border-[#D5AD72]/30'
                        }`}
                      >
                        {num}{num === 4 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <span className="block text-xs font-semibold uppercase text-[#142D26] mb-2">
                    Features
                  </span>
                  <div className="space-y-2">
                    {AVAILABLE_AMENITY_FILTERS.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-xs text-[#242424]">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="h-4 w-4 rounded border-[#D5AD72] text-[#142D26]"
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-6 border-t border-[#F7F5F0] space-y-2">
                <Button
                  variant="gold"
                  fullWidth
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Show {filteredRooms.length} Results
                </Button>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    fullWidth
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset All Filters
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
