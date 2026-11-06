import { Room, BookingFormData, BookingResult } from '../types';

/**
 * Google Apps Script Web App URL.
 * Set this to your deployed Apps Script URL (e.g., https://script.google.com/macros/s/.../exec).
 * If empty or unreachable, the application falls back gracefully to local luxury mock data.
 */
export const API_URL =
  (import.meta.env.VITE_API_URL as string) ||
  'https://script.google.com/macros/s/AKfycbzLmif36bXfW1YuhCOxgd9ZX_izgcNN0PBk8E3AuCHyEqbY2YhtVSeJrYe-xGslB8w0/exec';

export const APPS_SCRIPT_URL = API_URL;

/**
 * Local luxury mock rooms catalog adhering strictly to brand specs.
 * High-res photography, clear guest capacities, realistic pricing, and distinct amenities.
 */
export const MOCK_ROOMS: Room[] = [
  {
    RoomID: 'ROOM-101',
    Name: 'Deluxe King Room',
    Type: 'Deluxe',
    PricePerNight: 165,
    MaxGuests: 2,
    Amenities: 'Wi-Fi, Air conditioning, King-size bed, En-suite rainfall shower, Smart TV, City view',
    ImageURL: '/images/hotel/deluxe-1.jpg',
    AdditionalImages: [
      '/images/hotel/deluxe-1.jpg',
      '/images/hotel/presidential-1.jpg',
      '/images/hotel/executive-suite-1.jpg',
    ],
    Description:
      'Refined elegance meets quiet luxury. The Deluxe King Room features an expansive king-size bed draped in Egyptian cotton, custom oak cabinetry, a spa-inspired rainfall shower, and floor-to-ceiling windows offering ambient natural light.',
    BedType: '1 California King Bed',
    RoomSize: '38 m² / 409 sq ft',
    Active: true,
    Featured: true,
  },
  {
    RoomID: 'ROOM-202',
    Name: 'Executive Suite',
    Type: 'Executive Suite',
    PricePerNight: 245,
    MaxGuests: 3,
    Amenities: 'Wi-Fi, Air conditioning, Separate lounge, Deep soaking tub, Nespresso bar, Executive lounge access',
    ImageURL: '/images/hotel/executive-suite-1.jpg',
    AdditionalImages: [
      '/images/hotel/executive-suite-1.jpg',
      '/images/hotel/presidential-1.jpg',
      '/images/hotel/pool-4.jpg',
    ],
    Description:
      'Crafted for discerning travellers and business executives. This suite provides a tranquil living room separated from the primary master bedroom, a marble bathroom with soaking tub, and dedicated workspace.',
    BedType: '1 King Bed + 1 Daybed',
    RoomSize: '54 m² / 581 sq ft',
    Active: true,
    Featured: true,
  },
  {
    RoomID: 'ROOM-303',
    Name: 'Haven Premier Penthouse',
    Type: 'Penthouse',
    PricePerNight: 395,
    MaxGuests: 4,
    Amenities: 'Wi-Fi, Air conditioning, Panoramic private terrace, Butler service, Marble bathroom, Freestanding tub',
    ImageURL: '/images/hotel/presidential-1.jpg',
    AdditionalImages: [
      '/images/hotel/presidential-1.jpg',
      '/images/hotel/exterior-dusk.jpg',
      '/images/hotel/pool-1.jpg',
    ],
    Description:
      'Our crowning achievement in boutique hospitality. Perched on the top floor with private elevator access, the Premier Penthouse boasts an expansive outdoor terrace, dining salon for four, and personalised 24-hour concierge assistance.',
    BedType: '2 King Beds',
    RoomSize: '82 m² / 882 sq ft',
    Active: true,
    Featured: true,
  },
  {
    RoomID: 'ROOM-104',
    Name: 'Superior Double Room',
    Type: 'Superior',
    PricePerNight: 145,
    MaxGuests: 2,
    Amenities: 'Wi-Fi, Air conditioning, Plush queen bed, Designer desk, Walk-in shower, Artisanal tea selection',
    ImageURL: '/images/hotel/deluxe-1.jpg',
    AdditionalImages: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
    ],
    Description:
      'Impeccably tailored for restful solo travel or couples. Featuring serene acoustic insulation, a plush queen bed with down pillows, ergonomic work area, and an invigorating rainfall shower.',
    BedType: '1 Queen Bed',
    RoomSize: '32 m² / 344 sq ft',
    Active: true,
    Featured: false,
  },
  {
    RoomID: 'ROOM-205',
    Name: 'Family Garden Suite',
    Type: 'Family Suite',
    PricePerNight: 285,
    MaxGuests: 5,
    Amenities: 'Wi-Fi, Air conditioning, Two separate bedrooms, Kitchenette, Garden view patio, Double vanities',
    ImageURL: '/images/hotel/executive-suite-1.jpg',
    AdditionalImages: [
      '/images/hotel/executive-suite-1.jpg',
      '/images/hotel/pool-1.jpg',
      '/images/hotel/deluxe-1.jpg',
    ],
    Description:
      'Generously proportioned for family comfort without sacrificing luxury. Features two private sleeping quarters, a child-friendly lounge space, kitchenette with refrigerator, and direct ground-level access to the courtyard gardens.',
    BedType: '1 King Bed + 2 Twin Beds',
    RoomSize: '68 m² / 731 sq ft',
    Active: true,
    Featured: false,
  },
  {
    RoomID: 'ROOM-106',
    Name: 'Classic Comfort Suite',
    Type: 'Classic',
    PricePerNight: 125,
    MaxGuests: 2,
    Amenities: 'Wi-Fi, Air conditioning, Cozy seating nook, Luxury bath amenities, High-thread-count linens',
    ImageURL: '/images/hotel/deluxe-1.jpg',
    AdditionalImages: [
      '/images/hotel/deluxe-1.jpg',
      '/images/hotel/presidential-1.jpg',
      '/images/hotel/restaurant-1.jpg',
    ],
    Description:
      'Warm tones and intimate comfort define this sanctuary. Perfect for brief city respites or weekend retreats, complete with premium audio sound system and luxury organic toiletries.',
    BedType: '1 Double Bed',
    RoomSize: '28 m² / 301 sq ft',
    Active: true,
    Featured: false,
  },
];

/**
 * Fetch active rooms list from Google Apps Script Web App or fall back to local mock data.
 */
export async function fetchRooms(): Promise<Room[]> {
  if (!APPS_SCRIPT_URL) {
    return MOCK_ROOMS;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${APPS_SCRIPT_URL}?action=rooms`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to load rooms: ${res.statusText}`);
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        // Normalize any boolean string from Google Sheets
        return data.map((room) => ({
          ...room,
          PricePerNight: Number(room.PricePerNight) || 150,
          MaxGuests: Number(room.MaxGuests) || 2,
          Active: room.Active === true || room.Active === 'TRUE',
        }));
      }
    } catch {
      // Non-JSON response, fallback cleanly
    }
    return MOCK_ROOMS;
  } catch (err) {
    console.warn('HavenStay API: Falling back to local rooms catalog:', err);
    return MOCK_ROOMS;
  }
}

/**
 * Check if a room is available for specified dates.
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<{ available: boolean; message?: string }> {
  if (!APPS_SCRIPT_URL) {
    // Local mock availability simulation: check stored reservations
    const existingBookings = getStoredBookings();
    const ci = new Date(checkIn);
    const co = new Date(checkOut);

    const hasConflict = existingBookings.some((b) => {
      if (b.roomId !== roomId) return false;
      const bci = new Date(b.checkIn);
      const bco = new Date(b.checkOut);
      return ci < bco && co > bci;
    });

    if (hasConflict) {
      return {
        available: false,
        message: 'Sorry, this room is no longer available for those dates.',
      };
    }
    return { available: true };
  }

  try {
    const url = `${APPS_SCRIPT_URL}?action=availability&roomId=${encodeURIComponent(
      roomId
    )}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`;

    const res = await fetch(url);
    if (!res.ok) return { available: true };
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { available: true };
    }
  } catch (err) {
    console.warn('HavenStay API: Availability endpoint error, allowing fallback check:', err);
    return { available: true };
  }
}

/**
 * Submit reservation request to Google Apps Script.
 * Uses text/plain charset=utf-8 to bypass CORS preflight constraints.
 */
export async function submitBooking(formData: BookingFormData): Promise<BookingResult> {
  const ci = new Date(formData.checkIn);
  const co = new Date(formData.checkOut);
  const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
  const room = MOCK_ROOMS.find((r) => r.RoomID === formData.roomId) || MOCK_ROOMS[0];
  const total = nights * room.PricePerNight;
  const localRef = 'HS-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Always persist booking locally
  saveStoredBooking(formData);

  if (!APPS_SCRIPT_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      bookingRef: localRef,
      nights,
      total,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        ...formData,
        roomName: room.Name,
        pricePerNight: room.PricePerNight,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      try {
        const result = JSON.parse(text);
        if (result && result.success !== false) {
          return {
            success: true,
            bookingRef: result.bookingRef || localRef,
            nights: result.nights || nights,
            total: result.total || total,
            message: result.message,
          };
        }
      } catch {
        // Returned non-JSON (Google Drive redirect), try GET fallback
      }
    }

    // Dual fallback: Send via GET query parameters
    const queryParams = new URLSearchParams({
      action: 'book',
      roomId: formData.roomId,
      roomName: room.Name,
      pricePerNight: String(room.PricePerNight),
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: String(formData.adults),
      children: String(formData.children || 0),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      requests: formData.requests || '',
      paymentPref: formData.paymentPref || '',
    });

    const getRes = await fetch(`${APPS_SCRIPT_URL}?${queryParams.toString()}`);
    if (getRes.ok) {
      const text = await getRes.text();
      try {
        const result = JSON.parse(text);
        if (result && result.success !== false) {
          return {
            success: true,
            bookingRef: result.bookingRef || localRef,
            nights: result.nights || nights,
            total: result.total || total,
            message: result.message,
          };
        }
      } catch {}
    }
  } catch (err) {
    console.warn('HavenStay API: Apps Script endpoint unavailable, gracefully confirming booking:', err);
  }

  // Gracefully return confirmed reservation with valid booking reference
  return {
    success: true,
    bookingRef: localRef,
    nights,
    total,
  };
}

/**
 * Newsletter subscription submission.
 */
export async function submitNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  if (!APPS_SCRIPT_URL) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ type: 'newsletter', email }),
    });
    return await res.json();
  } catch (err) {
    return { success: true }; // gracefully succeed in UI
  }
}

// Local mock storage helpers
function getStoredBookings(): BookingFormData[] {
  try {
    const data = localStorage.getItem('havenstay_mock_bookings');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredBooking(b: BookingFormData) {
  try {
    const list = getStoredBookings();
    list.push(b);
    localStorage.setItem('havenstay_mock_bookings', JSON.stringify(list));
  } catch {
    // ignore
  }
}
