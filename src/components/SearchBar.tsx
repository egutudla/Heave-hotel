import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Bed, ArrowRight, AlertCircle } from 'lucide-react';
import { SearchParams } from '../types';
import { Button } from './Button';
import { DatePickerField } from './DatePickerField';

interface SearchBarProps {
  initialValues?: Partial<SearchParams>;
  onSearch: (params: SearchParams) => void;
  className?: string;
  isFloating?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValues,
  onSearch,
  className = '',
  isFloating = true,
}) => {
  // Format today's date for date minimums
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const defaultOut = new Date(today);
  defaultOut.setDate(defaultOut.getDate() + 3);
  const defaultOutStr = defaultOut.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(initialValues?.checkIn || '');
  const [checkOut, setCheckOut] = useState<string>(initialValues?.checkOut || '');
  const [adults, setAdults] = useState<number>(initialValues?.adults || 1);
  const [children, setChildren] = useState<number>(initialValues?.children || 0);
  const [roomsCount, setRoomsCount] = useState<number>(initialValues?.roomsCount || 1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state whenever initialValues reset or update
  useEffect(() => {
    setCheckIn(initialValues?.checkIn || '');
    setCheckOut(initialValues?.checkOut || '');
    setAdults(initialValues?.adults || 1);
    setChildren(initialValues?.children || 0);
    setRoomsCount(initialValues?.roomsCount || 1);
    setErrorMsg('');
  }, [
    initialValues?.checkIn,
    initialValues?.checkOut,
    initialValues?.adults,
    initialValues?.children,
    initialValues?.roomsCount,
  ]);

  const handleCheckInChange = (newCi: string) => {
    setCheckIn(newCi);
    setErrorMsg('');

    // If checkOut is now before or equal to newCheckIn, adjust checkOut to +1 day
    if (newCi && checkOut && new Date(checkOut) <= new Date(newCi)) {
      const nextDay = new Date(newCi);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (newCo: string) => {
    setCheckOut(newCo);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn) {
      setErrorMsg('Please select a check-in date.');
      return;
    }
    if (!checkOut) {
      setErrorMsg('Please select a check-out date.');
      return;
    }

    const ciDate = new Date(checkIn);
    const coDate = new Date(checkOut);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (ciDate < todayDate) {
      setErrorMsg('Check-in date cannot be in the past.');
      return;
    }

    if (coDate <= ciDate) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }

    if (adults < 1) {
      setErrorMsg('At least 1 adult is required.');
      return;
    }

    setErrorMsg('');
    onSearch({
      checkIn,
      checkOut,
      adults: Number(adults),
      children: Number(children),
      roomsCount: Number(roomsCount),
    });
  };

  // Check-out must be at least 1 day after check-in
  const minCheckOutDate = (() => {
    if (!checkIn) return todayStr;
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-5xl mx-auto ${
        isFloating
          ? 'relative -mt-16 sm:-mt-20 z-30 px-4 sm:px-6'
          : 'relative z-10 px-4 sm:px-0'
      } ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(20,45,38,0.12)] border border-[#D5AD72]/30">
        {/* Title & Authentic Hospitality Copy */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#F7F5F0]">
          <div>
            <h2
              className="text-lg sm:text-xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Check Room Availability
            </h2>
            <p className="text-xs text-[#242424]/70 mt-0.5">
              Select your stay dates and guests to view live rates and available accommodations.
            </p>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-medium text-[#B88E52] tracking-wider uppercase">
            Direct Reservation Guarantee
          </span>
        </div>

        {/* Validation Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Fields Grid */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* Check-In Date Field */}
            <div className="lg:col-span-3">
              <DatePickerField
                id="search-checkin"
                label="Check-in Date"
                value={checkIn}
                onChange={handleCheckInChange}
                minDate={todayStr}
                placeholder="Dates"
              />
            </div>

            {/* Check-Out Date Field */}
            <div className="lg:col-span-3">
              <DatePickerField
                id="search-checkout"
                label="Check-out Date"
                value={checkOut}
                onChange={handleCheckOutChange}
                minDate={minCheckOutDate}
                placeholder="Dates"
              />
            </div>

            {/* Rooms Count */}
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="search-rooms"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
              >
                Rooms
              </label>
              <div className="relative">
                <select
                  id="search-rooms"
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full min-h-[46px] pl-9 pr-7 text-xs sm:text-sm bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] transition-all appearance-none cursor-pointer"
                >
                  <option value={1}>1 Room</option>
                  <option value={2}>2 Rooms</option>
                  <option value={3}>3 Rooms</option>
                  <option value={4}>4 Rooms</option>
                </select>
                <Bed className="w-4 h-4 text-[#B88E52] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Adults & Children */}
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="search-adults"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
              >
                Guests
              </label>
              <div className="relative">
                <select
                  id="search-adults"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full min-h-[46px] pl-9 pr-7 text-xs sm:text-sm bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] transition-all appearance-none cursor-pointer"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                  <option value={5}>5 Adults</option>
                  <option value={6}>6+ Adults</option>
                </select>
                <Users className="w-4 h-4 text-[#B88E52] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Submit Action */}
            <div className="lg:col-span-2">
              <Button
                type="submit"
                variant="gold"
                fullWidth
                size="md"
                className="min-h-[46px] shadow-sm hover:shadow-md"
                icon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              >
                Booking
              </Button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
