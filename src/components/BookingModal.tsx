import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  Bed,
  CheckCircle,
  AlertCircle,
  Receipt,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Room, SearchParams, BookingFormData, BookingResult } from '../types';
import { submitBooking, checkRoomAvailability } from '../config/api';
import { Button } from './Button';
import { DatePickerField, formatHumanDate } from './DatePickerField';
import { useToast } from './Toast';
import { formatNaira } from '../utils/currency';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room | null;
  allRooms: Room[];
  searchParams?: Partial<SearchParams>;
  onBookingSuccess?: (result: BookingResult, bookingData: BookingFormData) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  allRooms,
  searchParams,
  onBookingSuccess,
}) => {
  const { showToast } = useToast();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const defaultCheckIn = searchParams?.checkIn || (() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const defaultCheckOut = searchParams?.checkOut || (() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  })();

  const [roomId, setRoomId] = useState<string>(selectedRoom?.RoomID || allRooms[0]?.RoomID || '');
  const [checkIn, setCheckIn] = useState<string>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(defaultCheckOut);
  const [roomsCount, setRoomsCount] = useState<number>(searchParams?.roomsCount || 1);
  const [adults, setAdults] = useState<number>(searchParams?.adults || 2);
  const [children, setChildren] = useState<number>(searchParams?.children || 0);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [requests, setRequests] = useState<string>('');
  const [paymentPref, setPaymentPref] = useState<'Pay at hotel' | 'Send me a payment link'>('Pay at hotel');
  const [consent, setConsent] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedResult, setConfirmedResult] = useState<BookingResult | null>(null);

  // Sync selectedRoom when prop changes
  useEffect(() => {
    if (selectedRoom) {
      setRoomId(selectedRoom.RoomID);
    } else if (allRooms.length > 0 && !roomId) {
      setRoomId(allRooms[0].RoomID);
    }
  }, [selectedRoom, allRooms]);

  // Sync searchParams if provided
  useEffect(() => {
    if (searchParams?.checkIn) setCheckIn(searchParams.checkIn);
    if (searchParams?.checkOut) setCheckOut(searchParams.checkOut);
    if (searchParams?.adults) setAdults(searchParams.adults);
    if (searchParams?.children !== undefined) setChildren(searchParams.children);
    if (searchParams?.roomsCount) setRoomsCount(searchParams.roomsCount);
  }, [searchParams]);

  if (!isOpen) return null;

  const currentRoom = allRooms.find((r) => r.RoomID === roomId) || selectedRoom || allRooms[0];

  // =========================================================================
  // STRICT PRICING FORMULA
  // Room Subtotal = Room Price Per Night × Number of Nights × Number of Rooms
  // Adults or children NEVER multiply the room price.
  // =========================================================================
  const ciDate = new Date(checkIn);
  const coDate = new Date(checkOut);
  const validDates = !isNaN(ciDate.getTime()) && !isNaN(coDate.getTime()) && coDate > ciDate;
  const nights = validDates ? Math.max(1, Math.round((coDate.getTime() - ciDate.getTime()) / 86400000)) : 1;
  const pricePerNight = currentRoom?.PricePerNight || 80000;
  const safeRoomsCount = Math.max(1, Number(roomsCount) || 1);

  // Core Subtotal calculation
  const roomSubtotal = pricePerNight * nights * safeRoomsCount;
  const taxesAndFees = 0; // Transparently included in the quoted room rate
  const totalPrice = roomSubtotal + taxesAndFees;

  // Maximum allowed capacity across the selected rooms
  const totalGuests = Number(adults) + Number(children);
  const maxRoomCapacity = (currentRoom?.MaxGuests || 2) * safeRoomsCount;
  const isCapacityExceeded = totalGuests > maxRoomCapacity;

  // Min check-out date (must be after check-in)
  const minCheckOutDate = (() => {
    if (!checkIn) return todayStr;
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const handleCheckInChange = (newDate: string) => {
    setCheckIn(newDate);
    setErrorMessage('');

    // If checkOut is on or before new checkIn, automatically push checkOut forward by 1 day
    if (newDate && checkOut && new Date(checkOut) <= new Date(newDate)) {
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (newDate: string) => {
    setCheckOut(newDate);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (loading) return;

    // Client-side validations
    if (!roomId) {
      setErrorMessage('Please select a room category.');
      return;
    }
    if (!checkIn || !checkOut) {
      setErrorMessage('Please specify check-in and check-out dates.');
      return;
    }
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    if (ciDate < todayZero) {
      setErrorMessage('Check-in date cannot be in the past.');
      return;
    }
    if (coDate <= ciDate) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }
    if (isCapacityExceeded) {
      setErrorMessage(
        `This selection exceeds maximum capacity of ${maxRoomCapacity} guests across ${safeRoomsCount} ${currentRoom?.Name || 'room'}(s). Please add another room or select a larger suite.`
      );
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please provide your phone number.');
      return;
    }
    if (!consent) {
      setErrorMessage('Please accept the reservation terms to proceed.');
      return;
    }

    setLoading(true);

    try {
      // 1. Availability check
      const avail = await checkRoomAvailability(roomId, checkIn, checkOut);
      if (!avail.available) {
        setErrorMessage(avail.message || 'Sorry, this room is no longer available for the selected dates.');
        setLoading(false);
        showToast('Room unavailable for these dates', 'error');
        return;
      }

      // 2. Submit reservation data
      const bookingData: BookingFormData = {
        roomId,
        checkIn,
        checkOut,
        roomsCount: safeRoomsCount,
        adults: Number(adults),
        children: Number(children),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        requests: requests.trim(),
        paymentPref,
        consent,
      };

      const result = await submitBooking(bookingData);

      if (result.success) {
        setConfirmedResult(result);
        showToast(`Reservation received. Reference: ${result.bookingRef}`, 'success');
        if (onBookingSuccess) {
          onBookingSuccess(result, bookingData);
        }
      } else {
        setErrorMessage(result.message || 'Unable to submit reservation. Please try again.');
        showToast(result.message || 'Booking submission error', 'error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
      showToast('Network error while submitting reservation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#142D26]/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-[0_24px_60px_rgba(20,45,38,0.25)] border border-[#D5AD72]/40 z-10 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F7F5F0] bg-[#F7F5F0]">
          <div>
            <h3
              className="text-xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Reserve Your Stay
            </h3>
            <p className="text-xs text-[#575757] mt-0.5">
              HavenStay Hotels · Direct reservation with transparent pricing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#575757] hover:text-[#142D26] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close reservation dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {confirmedResult ? (
          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#142D26] flex items-center justify-center text-[#D5AD72] shadow-md">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                Reservation Request Confirmed
              </span>
              <h2
                className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26] mt-1.5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Thank you, {fullName.split(' ')[0] || 'Guest'}
              </h2>
              <p className="text-sm text-[#575757] max-w-lg mx-auto mt-2 leading-relaxed">
                Your reservation has been recorded in our hotel system. A concierge member will review your itinerary and contact you shortly.
              </p>
            </div>

            {/* Reference & Summary Card */}
            <div className="bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#575757] block">
                  Booking Reference Number
                </span>
                <span className="text-2xl font-mono font-bold text-[#142D26] tracking-wider block mt-0.5">
                  {confirmedResult.bookingRef}
                </span>
              </div>

              <div className="pt-3 border-t border-[#D5AD72]/20 space-y-2 text-xs text-[#242424]">
                <div className="flex justify-between">
                  <span className="text-[#575757]">Accommodation</span>
                  <span className="font-semibold text-[#142D26]">{currentRoom?.Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#575757]">Check-in</span>
                  <span className="font-semibold text-[#142D26]">{formatHumanDate(checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#575757]">Check-out</span>
                  <span className="font-semibold text-[#142D26]">{formatHumanDate(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#575757]">Duration & Rooms</span>
                  <span className="font-semibold text-[#142D26]">
                    {nights} {nights === 1 ? 'Night' : 'Nights'} · {safeRoomsCount} {safeRoomsCount === 1 ? 'Room' : 'Rooms'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#575757]">Guests</span>
                  <span className="font-semibold text-[#142D26]">
                    {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#D5AD72]/20 items-baseline">
                  <span className="text-sm font-semibold text-[#142D26]">Total Amount</span>
                  <span className="text-lg font-serif font-bold text-[#142D26]">
                    {formatNaira(confirmedResult.total || totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
              >
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          /* Form Content with Live Summary */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-semibold block">Reservation Notice</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Fields (7 cols) */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
                {/* Room Selector */}
                <div>
                  <label
                    htmlFor="booking-room"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                  >
                    Room Category
                  </label>
                  <select
                    id="booking-room"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  >
                    {allRooms.map((r) => (
                      <option key={r.RoomID} value={r.RoomID}>
                        {r.Name} ({formatNaira(r.PricePerNight)} / night · Up to {r.MaxGuests} guests)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Fields using compact, human-formatted DatePickerField */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DatePickerField
                    id="booking-checkin"
                    label="Check-in Date"
                    value={checkIn}
                    onChange={handleCheckInChange}
                    minDate={todayStr}
                    required
                  />

                  <DatePickerField
                    id="booking-checkout"
                    label="Check-out Date"
                    value={checkOut}
                    onChange={handleCheckOutChange}
                    minDate={minCheckOutDate}
                    required
                  />
                </div>

                {/* Rooms & Guests */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Number of Rooms */}
                  <div>
                    <label
                      htmlFor="booking-rooms-count"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Rooms
                    </label>
                    <select
                      id="booking-rooms-count"
                      value={safeRoomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="w-full min-h-[46px] px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] cursor-pointer"
                    >
                      <option value={1}>1 Room</option>
                      <option value={2}>2 Rooms</option>
                      <option value={3}>3 Rooms</option>
                      <option value={4}>4 Rooms</option>
                      <option value={5}>5 Rooms</option>
                    </select>
                  </div>

                  {/* Adults */}
                  <div>
                    <label
                      htmlFor="booking-adults"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Adults
                    </label>
                    <select
                      id="booking-adults"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full min-h-[46px] px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] cursor-pointer"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                      <option value={5}>5 Adults</option>
                      <option value={6}>6 Adults</option>
                      <option value={7}>7 Adults</option>
                      <option value={8}>8+ Adults</option>
                    </select>
                  </div>

                  {/* Children */}
                  <div>
                    <label
                      htmlFor="booking-children"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Children
                    </label>
                    <select
                      id="booking-children"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full min-h-[46px] px-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72] cursor-pointer"
                    >
                      <option value={0}>0 Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                      <option value={3}>3 Children</option>
                      <option value={4}>4+ Children</option>
                    </select>
                  </div>
                </div>

                {/* Capacity warning alert if total guests exceed room limit */}
                {isCapacityExceeded && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      {safeRoomsCount} {currentRoom?.Name || 'room'}(s) accommodate up to {maxRoomCapacity} guests. Please add another room or select a larger suite.
                    </span>
                  </div>
                )}

                {/* Guest Contact Details */}
                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    placeholder="e.g. Danny Egutu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="booking-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      placeholder="e.g. danny@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[46px] px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      placeholder="e.g. +234 803 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[46px] px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                      required
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label
                    htmlFor="booking-requests"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="booking-requests"
                    rows={2}
                    placeholder="Late arrival, quiet room, upper floor, dietary preferences..."
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                    className="w-full p-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  />
                </div>

                {/* Payment Preference */}
                <div>
                  <label
                    htmlFor="booking-payment"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                  >
                    Payment Preference
                  </label>
                  <select
                    id="booking-payment"
                    value={paymentPref}
                    onChange={(e) =>
                      setPaymentPref(e.target.value as 'Pay at hotel' | 'Send me a payment link')
                    }
                    className="w-full min-h-[46px] px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  >
                    <option value="Pay at hotel">Pay at hotel upon check-in</option>
                    <option value="Send me a payment link">Send me a secure online payment link</option>
                  </select>
                </div>

                {/* Consent */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    id="booking-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#D5AD72] text-[#142D26] focus:ring-[#D5AD72] cursor-pointer"
                  />
                  <label htmlFor="booking-consent" className="text-xs text-[#575757] cursor-pointer leading-normal">
                    I understand that no advance payment is charged today. The hotel concierge will confirm room availability and reservation details directly.
                  </label>
                </div>

                {/* Submit button on mobile */}
                <div className="pt-2 lg:hidden">
                  <Button
                    type="submit"
                    variant="gold"
                    fullWidth
                    loading={loading}
                    size="lg"
                    disabled={isCapacityExceeded}
                  >
                    {loading ? 'Confirming Reservation...' : 'Confirm Reservation Request'}
                  </Button>
                </div>
              </form>

              {/* Transparent Price Breakdown Summary (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-[#F7F5F0] rounded-xl border border-[#D5AD72]/30">
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B88E52] block">
                    Transparent Price Breakdown
                  </span>

                  {/* Room Thumbnail & Title */}
                  {currentRoom && (
                    <div className="flex gap-3 pb-4 border-b border-[#D5AD72]/20">
                      <img
                        src={currentRoom.ImageURL || '/images/hotel/deluxe-1.jpg'}
                        alt={currentRoom.Name}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/images/hotel/deluxe-1.jpg';
                        }}
                        className="w-20 h-16 rounded-md object-cover shrink-0"
                      />
                      <div>
                        <h4
                          className="font-serif font-bold text-[#142D26] text-sm leading-snug"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {currentRoom.Name}
                        </h4>
                        <span className="text-xs text-[#575757] block mt-0.5">
                          {currentRoom.Type} · Up to {currentRoom.MaxGuests} guests/room
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Line Item Breakdown */}
                  <div className="space-y-2.5 text-xs text-[#242424]">
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Check-in Date</span>
                      <span className="font-medium text-[#142D26]">{formatHumanDate(checkIn) || '—'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#575757]">Check-out Date</span>
                      <span className="font-medium text-[#142D26]">{formatHumanDate(checkOut) || '—'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#575757]">Length of Stay</span>
                      <span className="font-semibold text-[#142D26]">
                        {nights} {nights === 1 ? 'Night' : 'Nights'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#575757]">Number of Rooms</span>
                      <span className="font-semibold text-[#142D26]">
                        {safeRoomsCount} {safeRoomsCount === 1 ? 'Room' : 'Rooms'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#575757]">Registered Guests</span>
                      <span className="font-medium text-[#142D26]">
                        {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child` : ''}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-[#D5AD72]/20">
                      <span className="text-[#575757]">Nightly Rate (per room)</span>
                      <span className="font-semibold text-[#142D26]">{formatNaira(pricePerNight)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#575757]">
                        Room Subtotal ({safeRoomsCount} rm × {nights} nt)
                      </span>
                      <span className="font-semibold text-[#142D26]">{formatNaira(roomSubtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#575757]">Taxes & Service Charges</span>
                      <span className="text-emerald-700 font-medium">Included</span>
                    </div>
                  </div>

                  {/* Final Booking Total */}
                  <div className="pt-4 border-t border-[#D5AD72]/30 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-semibold text-[#142D26] block">Final Total</span>
                        <span className="text-[10px] text-[#575757]">Calculated per room per night</span>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-2xl font-serif font-bold text-[#142D26]"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {formatNaira(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action for Desktop */}
                <div className="hidden lg:block pt-6">
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e as any)}
                    variant="gold"
                    fullWidth
                    loading={loading}
                    disabled={isCapacityExceeded}
                    size="md"
                    className="shadow-sm"
                  >
                    {loading ? 'Confirming Reservation...' : 'Confirm Reservation Request'}
                  </Button>
                  <p className="text-[11px] text-center text-[#575757] mt-2.5">
                    Direct booking confirmation · Pay at hotel or via payment link
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
