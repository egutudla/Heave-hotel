interface HandlerEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

// Seed initial bookings for serverless store
let memoryBookings = [
  {
    id: 'HS-8K2N9P',
    bookingRef: 'HS-8K2N9P',
    roomId: 'ROOM-101',
    roomName: 'Deluxe King Room',
    pricePerNight: 165000,
    checkIn: '2026-11-12',
    checkOut: '2026-11-15',
    nights: 3,
    adults: 2,
    children: 0,
    fullName: 'Chinedu Okafor',
    email: 'chinedu.okafor@example.com',
    phone: '+234 803 456 7890',
    paymentPref: 'Pay at hotel',
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    total: 495000,
  },
  {
    id: 'HS-4M7Q2A',
    bookingRef: 'HS-4M7Q2A',
    roomId: 'ROOM-202',
    roomName: 'Executive Suite',
    pricePerNight: 245000,
    checkIn: '2026-11-14',
    checkOut: '2026-11-17',
    nights: 3,
    adults: 2,
    children: 1,
    fullName: 'Fatima Aliyu',
    email: 'f.aliyu@example.com',
    phone: '+234 812 345 6789',
    paymentPref: 'Send me a payment link',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    total: 735000,
  },
];

const VALID_ADMINS = ['egutudanny6@gmail.com', 'admin@havenstay.com', 'admin'];
const VALID_PASSWORDS = ['HavenStay2026!', 'admin1234', 'havenstayhotels'];

export const handler = async (event: HandlerEvent, context?: any): Promise<HandlerResponse> => {
  const path = event.path.replace(/^\/\.netlify\/functions\/admin-api/, '');
  const method = event.httpMethod;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 1. Admin Login
  if (path.endsWith('/login') && method === 'POST') {
    try {
      const { emailOrUsername, password } = JSON.parse(event.body || '{}');
      const cleanUser = (emailOrUsername || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      const userValid = VALID_ADMINS.some((a) => a === cleanUser);
      const passValid = VALID_PASSWORDS.includes(cleanPass);

      if (userValid && passValid) {
        const token = 'HS-NETLIFY-' + Math.random().toString(36).substring(2, 12);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            token,
            user: {
              username: cleanUser,
              email: 'egutudanny6@gmail.com',
              name: 'Danny Egutu (Executive GM)',
              role: 'Super Admin',
            },
          }),
        };
      }
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid administrator credentials.' }),
      };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Bad request.' }) };
    }
  }

  // 2. Public Reservation Submission
  if (path.endsWith('/bookings') && method === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');
      const ref = 'HS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const ci = new Date(data.checkIn);
      const co = new Date(data.checkOut);
      const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
      const total = nights * (Number(data.pricePerNight) || 165000);

      const newBooking = {
        id: ref,
        bookingRef: ref,
        roomId: data.roomId,
        roomName: data.roomName || 'HavenStay Luxury Room',
        pricePerNight: Number(data.pricePerNight) || 165000,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights,
        adults: Number(data.adults) || 1,
        children: Number(data.children) || 0,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        requests: data.requests || '',
        paymentPref: data.paymentPref || 'Pay at hotel',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        total,
      };

      memoryBookings.unshift(newBooking);

      // Async relay to Google Apps Script
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzqG6y5pbnm59u-7j0FGZX35rezq_nhmxEECXVAhYLNxNEILaar_VZfJgdUX-YN5SDa/exec';
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(newBooking),
      }).catch(() => {});

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          bookingRef: ref,
          nights,
          total,
          status: 'Pending',
          message: 'Reservation recorded.',
        }),
      };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid booking data.' }) };
    }
  }

  // 3. Admin Reservations List
  if (path.endsWith('/reservations') && method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, reservations: memoryBookings }),
    };
  }

  // 4. Admin Stats
  if (path.endsWith('/stats') && method === 'GET') {
    const total = memoryBookings.length;
    const pending = memoryBookings.filter((b) => b.status === 'Pending').length;
    const confirmed = memoryBookings.filter((b) => b.status === 'Confirmed').length;
    const totalRevenue = memoryBookings
      .filter((b) => b.status === 'Confirmed')
      .reduce((sum, b) => sum + (b.total || 0), 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        stats: {
          total,
          pending,
          confirmed,
          totalRevenue,
          occupancyRate: Math.min(100, Math.round((confirmed / 18) * 100)),
          currency: 'NGN',
        },
      }),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ success: false, message: 'Route not found' }),
  };
};
