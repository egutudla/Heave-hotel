import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Room, SearchParams, BookingFormData, BookingResult } from '../types';
import { submitBooking, checkRoomAvailability } from '../config/api';
import { Button } from './Button';
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

  const defaultCheckIn = searchParams?.checkIn || todayStr;
  const defaultCheckOut =
    searchParams?.checkOut ||
    (() => {
      const d = new Date(today);
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })();

  const [roomId, setRoomId] = useState<string>(selectedRoom?.RoomID || allRooms[0]?.RoomID || '');
  const [checkIn, setCheckIn] = useState<string>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(defaultCheckOut);
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
  }, [searchParams]);

  if (!isOpen) return null;

  const currentRoom = allRooms.find((r) => r.RoomID === roomId) || selectedRoom || allRooms[0];

  // Calculate nights and totals in real time
  const ciDate = new Date(checkIn);
  const coDate = new Date(checkOut);
  const validDates = !isNaN(ciDate.getTime()) && !isNaN(coDate.getTime()) && coDate > ciDate;
  const nights = validDates ? Math.max(1, Math.round((coDate.getTime() - ciDate.getTime()) / 86400000)) : 1;
  const pricePerNight = currentRoom?.PricePerNight || 165000;
  const totalPrice = nights * pricePerNight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    if (!roomId) {
      setErrorMessage('Please select a room type.');
      return;
    }
    if (!checkIn || !checkOut) {
      setErrorMessage('Please specify check-in and check-out dates.');
      return;
    }
    if (ciDate < new Date(today.setHours(0, 0, 0, 0))) {
      setErrorMessage('Check-in date cannot be in the past.');
      return;
    }
    if (coDate <= ciDate) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }
    if (Number(adults) + Number(children) > (currentRoom?.MaxGuests || 2)) {
      setErrorMessage(`This room holds up to ${currentRoom?.MaxGuests} guests. Please adjust guests or select a larger suite.`);
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
      setErrorMessage('Please accept the HavenStay reservation policy to proceed.');
      return;
    }

    setLoading(true);

    try {
      // 1. Availability check
      const avail = await checkRoomAvailability(roomId, checkIn, checkOut);
      if (!avail.available) {
        setErrorMessage(avail.message || 'Sorry, this room is no longer available for those dates.');
        setLoading(false);
        showToast('Room is not available for selected dates', 'error');
        return;
      }

      // 2. Submit booking to backend
      const bookingData: BookingFormData = {
        roomId,
        checkIn,
        checkOut,
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
        showToast(`Reservation request received! Ref: ${result.bookingRef}`, 'success');
        if (onBookingSuccess) {
          onBookingSuccess(result, bookingData);
        }
      } else {
        setErrorMessage(result.message || 'Failed to submit reservation. Please try again.');
        showToast(result.message || 'Error creating booking', 'error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
            <p className="text-xs text-[#575757]">
              HavenStay Hotels · Guaranteed direct booking privilege
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#575757] hover:text-[#142D26] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {confirmedResult ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#142D26] flex items-center justify-center text-[#D5AD72] shadow-lg">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                Reservation Request Received
              </span>
              <h2
                className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26] mt-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Thank you, {fullName.split(' ')[0] || 'Guest'}!
              </h2>
              <p className="text-sm text-[#575757] max-w-lg mx-auto mt-2">
                Your reservation request has been received. We'll contact you shortly to confirm your itinerary.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-xl p-5 max-w-md mx-auto">
              <span className="text-xs uppercase tracking-wider text-[#575757] block">
                Booking Reference
              </span>
              <span className="text-2xl font-mono font-bold text-[#142D26] tracking-wider block mt-1">
                {confirmedResult.bookingRef}
              </span>
              <div className="flex justify-between items-center text-xs text-[#242424]/80 mt-4 pt-3 border-t border-[#D5AD72]/20">
                <span>{currentRoom?.Name}</span>
                <span>{nights} {nights === 1 ? 'night' : 'nights'} · {formatNaira(confirmedResult.total || totalPrice)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
              >
                Return to Exploration
              </Button>
            </div>
          </div>
        ) : (
          /* Form Content with Side Summary */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-semibold block">Booking Notification</span>
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
                    Room / Apartment Type
                  </label>
                  <select
                    id="booking-room"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  >
                    {allRooms.map((r) => (
                      <option key={r.RoomID} value={r.RoomID}>
                        {r.Name} ({formatNaira(r.PricePerNight)}/night - up to {r.MaxGuests} guests)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="booking-checkin"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Check-in Date
                    </label>
                    <input
                      id="booking-checkin"
                      type="date"
                      min={todayStr}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-checkout"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Check-out Date
                    </label>
                    <input
                      id="booking-checkout"
                      type="date"
                      min={checkIn || todayStr}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="booking-adults"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Adults (min 1)
                    </label>
                    <input
                      id="booking-adults"
                      type="number"
                      min={1}
                      max={6}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-children"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Children
                    </label>
                    <input
                      id="booking-children"
                      type="number"
                      min={0}
                      max={4}
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                    />
                  </div>
                </div>

                {/* Guest Personal Information */}
                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    placeholder="e.g. Julian Montgomery"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="booking-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      placeholder="julian@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#142D26] mb-1.5"
                    >
                      Phone Number
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
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
                    placeholder="Late arrival, high floor preference, dietary requirements, or extra pillows..."
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
                    className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  >
                    <option value="Pay at hotel">Pay at hotel upon check-in</option>
                    <option value="Send me a payment link">Send me a secure payment link</option>
                  </select>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    id="booking-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#D5AD72] text-[#142D26] focus:ring-[#D5AD72] cursor-pointer"
                  />
                  <label htmlFor="booking-consent" className="text-xs text-[#575757] cursor-pointer">
                    I agree to the HavenStay Hotels reservation and privacy policies. Status will remain Pending until concierge confirmation.
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
                  >
                    Confirm Reservation Request
                  </Button>
                </div>
              </form>

              {/* Live Summary Panel (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-[#F7F5F0] rounded-xl border border-[#D5AD72]/30">
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B88E52] block">
                    Live Booking Summary
                  </span>

                  {/* Room Thumbnail & Title */}
                  {currentRoom && (
                    <div className="flex gap-3 pb-4 border-b border-[#D5AD72]/20">
                      <img
                        src={currentRoom.ImageURL}
                        alt={currentRoom.Name}
                        className="w-20 h-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div>
                        <h4
                          className="font-serif font-bold text-[#142D26] text-sm leading-snug"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {currentRoom.Name}
                        </h4>
                        <span className="text-xs text-[#575757] block mt-0.5">
                          {currentRoom.Type} · Max {currentRoom.MaxGuests} Guests
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Itinerary Details */}
                  <div className="space-y-2 text-xs text-[#242424]">
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Check-in</span>
                      <span className="font-semibold text-[#142D26]">{checkIn || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Check-out</span>
                      <span className="font-semibold text-[#142D26]">{checkOut || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Duration</span>
                      <span className="font-semibold text-[#142D26]">
                        {nights} {nights === 1 ? 'Night' : 'Nights'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Guests</span>
                      <span className="font-semibold text-[#142D26]">
                        {adults} Adult{adults > 1 ? 's' : ''}
                        {children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#575757]">Nightly Rate</span>
                      <span className="font-semibold text-[#142D26]">{formatNaira(pricePerNight)}</span>
                    </div>
                  </div>

                  {/* Total Calculation */}
                  <div className="pt-4 border-t border-[#D5AD72]/25 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-[#142D26]">Estimated Total</span>
                      <div className="text-right">
                        <span
                          className="text-2xl font-serif font-bold text-[#142D26]"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {formatNaira(totalPrice)}
                        </span>
                        <span className="text-[10px] text-[#575757] block">Taxes & fees included</span>
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
                    size="md"
                    className="shadow-md"
                  >
                    Confirm Reservation Request
                  </Button>
                  <p className="text-[10px] text-center text-[#575757] mt-2.5">
                    Zero prepayment required today. Confirmed via email.
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
