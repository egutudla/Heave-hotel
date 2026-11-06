import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { SearchParams } from '../types';
import { Button } from './Button';

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
  // Format today's date for HTML date input min attribute
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const defaultOut = new Date(today);
  defaultOut.setDate(defaultOut.getDate() + 3);
  const defaultOutStr = defaultOut.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(initialValues?.checkIn || tomorrowStr);
  const [checkOut, setCheckOut] = useState<string>(initialValues?.checkOut || defaultOutStr);
  const [adults, setAdults] = useState<number>(initialValues?.adults ?? 2);
  const [children, setChildren] = useState<number>(initialValues?.children ?? 0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCi = e.target.value;
    setCheckIn(newCi);
    setErrorMsg('');

    // If checkOut is now before or equal to newCheckIn, adjust checkOut to +1 day
    if (newCi && checkOut && new Date(checkOut) <= new Date(newCi)) {
      const nextDay = new Date(newCi);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCo = e.target.value;
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
    });
  };

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
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#F7F5F0]">
          <div>
            <h2
              className="text-lg sm:text-xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Find Your Perfect Stay
            </h2>
            <p className="text-xs text-[#242424]/70 mt-0.5">
              Live availability, best guaranteed rates, and complimentary concierge.
            </p>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-medium text-[#B88E52] tracking-wider uppercase">
            Direct Booking Privilege
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
            {/* Check-In */}
            <div className="space-y-1">
              <label
                htmlFor="search-check-in"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
              >
                Check-in
              </label>
              <div className="relative">
                <input
                  id="search-check-in"
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={handleCheckInChange}
                  className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] focus:border-transparent transition-all"
                  required
                />
                <Calendar className="w-4 h-4 text-[#B88E52] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Check-Out */}
            <div className="space-y-1">
              <label
                htmlFor="search-check-out"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
              >
                Check-out
              </label>
              <div className="relative">
                <input
                  id="search-check-out"
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={handleCheckOutChange}
                  className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] focus:border-transparent transition-all"
                  required
                />
                <Calendar className="w-4 h-4 text-[#B88E52] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Adults */}
            <div className="space-y-1">
              <label
                htmlFor="search-adults"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
              >
                Adults
              </label>
              <div className="relative">
                <select
                  id="search-adults"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-8 text-xs sm:text-sm bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                  <option value={5}>5+ Adults</option>
                </select>
                <Users className="w-4 h-4 text-[#B88E52] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Children */}
            <div className="space-y-1">
              <label
                htmlFor="search-children"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
              >
                Children
              </label>
              <div className="relative">
                <select
                  id="search-children"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-8 text-xs sm:text-sm bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value={0}>0 Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                  <option value={3}>3+ Children</option>
                </select>
                <Users className="w-4 h-4 text-[#B88E52] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="gold"
                fullWidth
                size="md"
                className="h-11 shadow-md hover:shadow-lg"
                icon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              >
                Check Availability
              </Button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
