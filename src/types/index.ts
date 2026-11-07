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

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'General Manager' | 'Reservations Manager' | 'Duty Manager';
  name: string;
  lastLogin?: string;
}

export type AdminPortalSection =
  | 'overview'
  | 'reservations'
  | 'rooms'
  | 'guests'
  | 'revenue'
  | 'dining'
  | 'events-offers'
  | 'gallery'
  | 'website-content'
  | 'settings';

export interface MenuItem {
  id: string;
  name: string;
  category: 'Appetizers' | 'Mains' | 'Seafood' | 'Desserts' | 'Cocktails' | 'Wine';
  price: number;
  description: string;
  available: boolean;
}

export interface DiningVenueData {
  id: string;
  name: string;
  tagline: string;
  hours: string;
  dressCode: string;
  capacity: number;
  menu: MenuItem[];
}

export interface HotelEventOffer {
  id: string;
  type: 'event' | 'offer';
  title: string;
  subtitle: string;
  category: string;
  discountOrPrice: string;
  validThrough: string;
  status: 'Active' | 'Draft' | 'Expired';
  description: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Suites' | 'Dining' | 'Pool & Bar' | 'Architecture' | 'Events';
  imageUrl: string;
  featured: boolean;
  uploadedAt: string;
}

export interface GuestProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string;
  vipStatus: boolean;
  notes?: string;
}

export interface HotelContentSettings {
  hotelName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
  heroHeadline: string;
  heroSubheadline: string;
}

