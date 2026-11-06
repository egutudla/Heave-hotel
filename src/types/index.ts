export interface Room {
  RoomID: string;
  Name: string;
  Type: 'Deluxe' | 'Executive Suite' | 'Penthouse' | 'Superior' | 'Family Suite' | 'Classic';
  PricePerNight: number;
  MaxGuests: number;
  Amenities: string; // comma-delimited from Google Sheets / config
  ImageURL: string;
  AdditionalImages?: string[];
  Description: string;
  BedType?: string;
  RoomSize?: string;
  Active: boolean | string;
  Featured?: boolean;
}

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export interface BookingFormData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  phone: string;
  requests?: string;
  paymentPref: 'Pay at hotel' | 'Send me a payment link';
  consent: boolean;
}

export interface BookingResult {
  success: boolean;
  bookingRef?: string;
  nights?: number;
  total?: number;
  message?: string;
}

export interface BookingRecord extends BookingFormData {
  id: string;
  bookingRef: string;
  roomName: string;
  pricePerNight: number;
  nights: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface AmenityItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPlaceholder: boolean;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  location: string;
  roomType: string;
  rating: number;
  isPlaceholder: boolean;
}

export interface OfferItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  terms: string;
  imageUrl: string;
  isPlaceholder: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}
