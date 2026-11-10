import React, { useState, useMemo, useEffect } from 'react';
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
  Wifi,
  Wind,
  Bed,
  Sparkles,
  Layers,
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

/**
 * Robust, case-insensitive amenity matcher that checks room amenities,
 * bed configuration, and descriptions against common hotel terms and synonyms.
 */
export function roomHasAmenity(room: Room, filterAmenity: string): boolean {
  if (!room) return false;
  const searchableText = `${room.Amenities || ''} ${room.Description || ''} ${room.BedType || ''}`.toLowerCase();
  const filter = filterAmenity.trim().toLowerCase();

  switch (filter) {
    case 'wi-fi':
    case 'wifi':
      return (
        searchableText.includes('wi-fi') ||
        searchableText.includes('wifi') ||
        searchableText.includes('internet')
      );
    case 'air conditioning':
    case 'ac':
      return (
        searchableText.includes('air conditioning') ||
        searchableText.includes('climate control') ||
        searchableText.includes(' ac') ||
        searchableText.includes('a/c')
      );
    case 'king-size bed':
    case 'king bed':
      return (
        searchableText.includes('king') ||
        (room.BedType ? room.BedType.toLowerCase().includes('king') : false)
      );
    case 'balcony':
    case 'terrace':
    case 'patio':
      return (
        searchableText.includes('balcony') ||
        searchableText.includes('terrace') ||
        searchableText.includes('patio')
      );
    case 'city view':
      return (
        searchableText.includes('city view') ||
        searchableText.includes('skyline') ||
        searchableText.includes('city')
      );
    case 'bathtub':
    case 'tub':
      return (
        searchableText.includes('bathtub') ||
        searchableText.includes('soaking tub') ||
        searchableText.includes('freestanding tub') ||
        searchableText.includes('tub')
      );
    case 'kitchenette':
    case 'kitchen':
      return (
        searchableText.includes('kitchenette') ||
        searchableText.includes('kitchen') ||
        searchableText.includes('refrigerator')
      );
    default:
      return searchableText.includes(filter);
  }
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  rooms,
  loading,
  searchParams,
  onSearchChange,
  onViewDetails,
  onReserve,
  onNavigate,
}) => {
  // Compute dynamic price range based on actual room records
  const { minPriceBound, maxPriceBound } = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return { minPriceBound: 50000, maxPriceBound: 450000 };
    }
    const prices = rooms.map((r) => r.PricePerNight).filter((p) => typeof p === 'number' && p > 0);
    if (prices.length === 0) return { minPriceBound: 50000, maxPriceBound: 450000 };
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      minPriceBound: Math.floor(min / 10000) * 10000,
      maxPriceBound: Math.ceil(max / 10000) * 10000,
    };
  }, [rooms]);

  // Primary Filter State Management (Pure React State, zero page reload required)
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [capacityFilter, setCapacityFilter] = useState<number>(0); // 0 = Any, 1 = 1+, 2 = 2+, 3 = 3+, 4 = 4+
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'capacity-desc'>('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize maxPrice from dynamic room bounds once rooms load
  useEffect(() => {
    if (maxPriceBound > 0 && maxPrice === 500000) {
      setMaxPrice(maxPriceBound);
    }
  }, [maxPriceBound]);

  // Toggle single amenity
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Remove single filter item
  const removeAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => prev.filter((a) => a !== amenity));
  };

  // Reset all filters to default
  const resetFilters = () => {
    setSelectedType('All Types');
    setMinPrice(0);
    setMaxPrice(maxPriceBound || 500000);
    setCapacityFilter(0);
    setSelectedAmenities([]);
    setSortBy('default');
    onSearchChange({
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      roomsCount: 1,
    });
  };

  // Dynamic Filtering Logic (AND-based, reactive, high-performance)
  const filteredRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    return rooms
      .filter((room) => {
        // 1. Active room status check
        if (room.Active === false) {
          return false;
        }

        // 2. Room Type / Category Filter
        if (selectedType !== 'All Types' && room.Type !== selectedType) {
          return false;
        }

        // 3. Price Filter (Strict bounds: minPrice <= price <= maxPrice)
        if (minPrice > 0 && room.PricePerNight < minPrice) {
          return false;
        }
        if (maxPrice > 0 && room.PricePerNight > maxPrice) {
          return false;
        }

        // 4. Guest Capacity Filter (Independent of price; checks room.MaxGuests >= capacity)
        if (capacityFilter > 0) {
          if (capacityFilter >= 4) {
            if (room.MaxGuests < 4) return false;
          } else {
            if (room.MaxGuests < capacityFilter) return false;
          }
        }

        // 5. Amenities Filter (AND condition: room must satisfy EVERY selected amenity)
        if (selectedAmenities.length > 0) {
          const satisfiesAll = selectedAmenities.every((amenity) =>
            roomHasAmenity(room, amenity)
          );
          if (!satisfiesAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.PricePerNight - b.PricePerNight;
        if (sortBy === 'price-desc') return b.PricePerNight - a.PricePerNight;
        if (sortBy === 'capacity-desc') return b.MaxGuests - a.MaxGuests;
        // Default: featured first, then price
        if (a.Featured && !b.Featured) return -1;
        if (!a.Featured && b.Featured) return 1;
        return a.PricePerNight - b.PricePerNight;
      });
  }, [rooms, selectedType, minPrice, maxPrice, capacityFilter, selectedAmenities, sortBy]);

  // Active filter count for badges
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];

    if (selectedType !== 'All Types') {
      list.push({
        id: 'type',
        label: `Category: ${selectedType}`,
        onRemove: () => setSelectedType('All Types'),
      });
    }

    if (maxPrice < maxPriceBound) {
      list.push({
        id: 'maxPrice',
        label: `Max ${formatNaira(maxPrice)}`,
        onRemove: () => setMaxPrice(maxPriceBound),
      });
    }

    if (minPrice > 0) {
      list.push({
        id: 'minPrice',
        label: `Min ${formatNaira(minPrice)}`,
        onRemove: () => setMinPrice(0),
      });
    }

    if (capacityFilter > 0) {
      list.push({
        id: 'capacity',
        label: `${capacityFilter}${capacityFilter >= 4 ? '+' : ''} Guests`,
        onRemove: () => {
          setCapacityFilter(0);
          onSearchChange({ ...searchParams, adults: 1 });
        },
      });
    }

    selectedAmenities.forEach((amenity) => {
      list.push({
        id: `amenity-${amenity}`,
        label: amenity,
        onRemove: () => removeAmenity(amenity),
      });
    });

    return list;
  }, [selectedType, minPrice, maxPrice, maxPriceBound, capacityFilter, selectedAmenities]);

  return (
    <div className="w-full pb-24">
      {/* Hero Banner with video and breadcrumb */}
      <section className="relative min-h-[50vh] sm:min-h-[58vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/rooms-suites.jpg"
            className="w-full h-full object-cover origin-center opacity-70 filter brightness-90 transform-gpu"
          >
            <source src="/videos/rooms-suites.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F1A] via-[#0D1F1A]/50 to-black/35" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D5AD72] font-semibold"
          >
            <span>HavenStay Victoria Island</span>
            <span>·</span>
            <span>Accommodations</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Rooms & <span className="italic font-normal text-[#E4C38E]">Suites</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Thoughtfully tailored sanctuaries designed for deep rest — every room impeccably appointed with luxury linens and discreet service.
          </motion.p>
        </div>
      </section>

      {/* Floating Date Search Bar */}
      <ScrollReveal yOffset={30} delay={0.1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <SearchBar
          initialValues={searchParams}
          onSearch={(params) => {
            onSearchChange(params);
            if (params.adults) {
              setCapacityFilter(params.adults >= 4 ? 4 : params.adults);
            }
          }}
          isFloating={false}
        />
      </ScrollReveal>

      {/* Main Filter & Rooms Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        {/* Top Control Bar: Results count, Active Badges, Mobile filter button, Sort dropdown */}
        <div className="pb-6 mb-6 border-b border-[#D5AD72]/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142D26]">
                  {loading ? 'Searching Accommodations...' : `${filteredRooms.length} Available ${filteredRooms.length === 1 ? 'Room' : 'Rooms'}`}
                </h2>
                {activeFilters.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#142D26] text-white text-xs font-medium">
                    {activeFilters.length} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#575757] mt-1">
                Prices displayed in Nigerian Naira (₦) · Direct booking guarantee
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Drawer Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#D5AD72]/40 text-xs font-semibold text-[#142D26] shadow-xs cursor-pointer hover:bg-[#F7F5F0] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B88E52]" />
                <span>Filters {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#575757] hidden sm:inline font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3.5 bg-white border border-[#D5AD72]/40 rounded-lg text-xs font-medium text-[#142D26] focus:outline-none focus:ring-2 focus:ring-[#D5AD72] cursor-pointer shadow-xs"
                >
                  <option value="default">Featured & Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="capacity-desc">Capacity: Highest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips with 1-Click Dismiss */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#575757] font-medium mr-1">Active filters:</span>
              {activeFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={f.onRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142D26]/10 hover:bg-[#142D26]/20 text-[#142D26] text-xs font-medium transition-colors cursor-pointer group"
                  title="Click to remove filter"
                >
                  <span>{f.label}</span>
                  <X className="w-3.5 h-3.5 text-[#B88E52] group-hover:text-red-700" />
                </button>
              ))}

              <button
                onClick={resetFilters}
                className="text-xs text-[#B88E52] hover:text-[#142D26] font-semibold underline underline-offset-2 ml-2 cursor-pointer transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Content Columns: Desktop Sidebar (3 cols) + Rooms Grid (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28">
            <div className="bg-white rounded-xl p-6 border border-[#D5AD72]/30 shadow-xs space-y-6">
              {/* Header with Reset */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F7F5F0]">
                <span className="font-serif font-bold text-sm text-[#142D26] uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#B88E52]" />
                  Filter Rooms
                </span>
                {activeFilters.length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#B88E52] hover:text-[#142D26] flex items-center gap-1 cursor-pointer transition-colors font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* 1. Room Category Filter */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-3">
                  Room Category
                </span>
                <div className="space-y-1">
                  {ROOM_TYPES.map((type) => {
                    const isSelected = selectedType === type;
                    // Count how many total rooms match this category
                    const typeCount =
                      type === 'All Types'
                        ? rooms.length
                        : rooms.filter((r) => r.Type === type).length;

                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#142D26] text-white shadow-xs'
                            : 'text-[#242424] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        <span>{type}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] ${
                              isSelected ? 'text-[#D5AD72]' : 'text-[#575757]'
                            }`}
                          >
                            ({typeCount})
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D5AD72]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range Filter (Dynamic calculation from actual room rates) */}
              <div className="pt-2 border-t border-[#F7F5F0] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#142D26]">
                    Max Nightly Rate
                  </span>
                  <span className="text-xs font-bold text-[#142D26] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#D5AD72]/20">
                    {formatNaira(maxPrice)}
                  </span>
                </div>

                <input
                  type="range"
                  min={minPriceBound}
                  max={maxPriceBound}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#142D26] cursor-pointer h-2 bg-[#F7F5F0] rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-[#575757]">
                  <span>{formatNaira(minPriceBound)}</span>
                  <span>{formatNaira(maxPriceBound)}</span>
                </div>

                {/* Quick Budget Presets */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(150000);
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                      maxPrice === 150000 && minPrice === 0
                        ? 'bg-[#142D26] text-white border-[#142D26]'
                        : 'bg-[#F7F5F0] text-[#575757] border-[#D5AD72]/30 hover:border-[#D5AD72]'
                    }`}
                  >
                    Under ₦150k
                  </button>
                  <button
                    onClick={() => {
                      setMinPrice(150000);
                      setMaxPrice(maxPriceBound);
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                      minPrice === 150000
                        ? 'bg-[#142D26] text-white border-[#142D26]'
                        : 'bg-[#F7F5F0] text-[#575757] border-[#D5AD72]/30 hover:border-[#D5AD72]'
                    }`}
                  >
                    ₦150k & Above
                  </button>
                </div>
              </div>

              {/* 3. Guest Capacity Filter (Independent of room pricing) */}
              <div className="pt-2 border-t border-[#F7F5F0]">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]">
                    Guest Capacity
                  </span>
                  {capacityFilter > 0 && (
                    <button
                      onClick={() => setCapacityFilter(0)}
                      className="text-[11px] text-[#B88E52] hover:text-[#142D26]"
                    >
                      Any
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {[
                    { val: 0, label: 'Any' },
                    { val: 1, label: '1' },
                    { val: 2, label: '2' },
                    { val: 3, label: '3' },
                    { val: 4, label: '4+' },
                  ].map((btn) => {
                    const isSelected = capacityFilter === btn.val;
                    return (
                      <button
                        key={btn.val}
                        onClick={() => setCapacityFilter(btn.val)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#142D26] text-white border-[#142D26] shadow-xs'
                            : 'bg-[#F7F5F0] text-[#242424] border-[#D5AD72]/30 hover:border-[#D5AD72]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-[#575757] block mt-1.5">
                  Filters rooms that accommodate at least this many guests
                </span>
              </div>

              {/* 4. Features & Amenities Checkboxes (Strict AND condition) */}
              <div className="pt-2 border-t border-[#F7F5F0]">
                <div className="flex justify-between items-center mb-3">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]">
                    Features & Amenities
                  </span>
                  {selectedAmenities.length > 0 && (
                    <button
                      onClick={() => setSelectedAmenities([])}
                      className="text-[11px] text-[#B88E52] hover:text-[#142D26]"
                    >
                      Clear ({selectedAmenities.length})
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {AVAILABLE_AMENITY_FILTERS.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    // Check how many rooms have this amenity
                    const matchCount = rooms.filter((r) => roomHasAmenity(r, amenity)).length;

                    return (
                      <label
                        key={amenity}
                        className="flex items-center justify-between text-xs text-[#242424] cursor-pointer select-none group py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAmenity(amenity)}
                            className="h-4 w-4 rounded border-[#D5AD72] text-[#142D26] focus:ring-[#D5AD72] cursor-pointer"
                          />
                          <span className={`group-hover:text-[#142D26] transition-colors ${isChecked ? 'font-semibold text-[#142D26]' : ''}`}>
                            {amenity}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#575757]">({matchCount})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Rooms Grid (9 cols) */}
          <main className="lg:col-span-9">
            {loading ? (
              /* Loading Skeleton */
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
              /* Informative Empty State */
              <div className="text-center py-16 px-6 bg-white rounded-xl border border-[#D5AD72]/30 max-w-lg mx-auto space-y-4 shadow-sm my-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#B88E52]">
                  <Search className="w-8 h-8" />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-serif font-bold text-[#142D26]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  No Rooms Match Your Selected Filters
                </h3>
                <p className="text-xs sm:text-sm text-[#575757] leading-relaxed max-w-md mx-auto">
                  We could not find any available accommodations satisfying all your current filter criteria. Try broadening your price budget or unchecking some amenities.
                </p>
                <div className="pt-3">
                  <Button variant="gold" size="md" onClick={resetFilters}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All Filters ({rooms.length} Rooms Available)
                  </Button>
                </div>
              </div>
            ) : (
              /* Animated Room Cards Grid with View Details & Reserve Now */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredRooms.map((room, idx) => (
                    <motion.div
                      key={room.RoomID}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Mobile Filter Drawer (Fully Synchronized) */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-[#142D26]/70 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]">
                  <div>
                    <h3
                      className="font-serif font-bold text-lg text-[#142D26]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Filter Rooms
                    </h3>
                    <p className="text-xs text-[#575757]">
                      {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'} matching
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 rounded-full text-[#575757] hover:text-[#142D26]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category */}
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

                {/* Price */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-[#142D26]">Max Nightly Rate</span>
                    <span className="font-bold text-[#142D26]">{formatNaira(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={minPriceBound}
                    max={maxPriceBound}
                    step={10000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#142D26]"
                  />
                  <div className="flex justify-between text-[11px] text-[#575757] mt-1">
                    <span>{formatNaira(minPriceBound)}</span>
                    <span>{formatNaira(maxPriceBound)}</span>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <span className="block text-xs font-semibold uppercase text-[#142D26] mb-2">
                    Guest Capacity
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { val: 0, label: 'Any' },
                      { val: 1, label: '1' },
                      { val: 2, label: '2' },
                      { val: 3, label: '3' },
                      { val: 4, label: '4+' },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        onClick={() => setCapacityFilter(btn.val)}
                        className={`py-2 text-xs font-medium rounded-lg border ${
                          capacityFilter === btn.val
                            ? 'bg-[#142D26] text-white border-[#142D26]'
                            : 'bg-[#F7F5F0] text-[#242424] border-[#D5AD72]/30'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <span className="block text-xs font-semibold uppercase text-[#142D26] mb-2">
                    Features & Amenities
                  </span>
                  <div className="space-y-2">
                    {AVAILABLE_AMENITY_FILTERS.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-xs text-[#242424] cursor-pointer">
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
                  Show {filteredRooms.length} Available Rooms
                </Button>
                {activeFilters.length > 0 && (
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
