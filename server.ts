import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Shared Persistence Store (Shared between Public Customer Website and Management Portal)
interface BookingRecord {
  id: string;
  bookingRef: string;
  roomId: string;
  roomName: string;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomsCount?: number;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  phone: string;
  requests?: string;
  paymentPref: 'Pay at hotel' | 'Send me a payment link';
  status: 'Pending' | 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
  createdAt: string;
  total: number;
}

let reservationsStore: BookingRecord[] = [
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
    requests: 'High floor preferred, quiet room with city skyline view.',
    paymentPref: 'Pay at hotel',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
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
    requests: 'Airport pickup requested at 2:00 PM.',
    paymentPref: 'Send me a payment link',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    total: 735000,
  },
  {
    id: 'HS-9W1L4D',
    bookingRef: 'HS-9W1L4D',
    roomId: 'ROOM-303',
    roomName: 'Haven Premier Penthouse',
    pricePerNight: 395000,
    checkIn: '2026-11-18',
    checkOut: '2026-11-20',
    nights: 2,
    adults: 2,
    children: 0,
    fullName: 'Tunde Balogun',
    email: 'tunde.b@example.com',
    phone: '+234 907 577 2701',
    requests: 'Anniversary celebration. Complimentary champagne setup please.',
    paymentPref: 'Pay at hotel',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    total: 790000,
  },
  {
    id: 'HS-2J8R5X',
    bookingRef: 'HS-2J8R5X',
    roomId: 'ROOM-104',
    roomName: 'Superior Double Room',
    pricePerNight: 145000,
    checkIn: '2026-11-22',
    checkOut: '2026-11-25',
    nights: 3,
    adults: 1,
    children: 0,
    fullName: 'Dr. Ngozi Eze',
    email: 'dr.eze@healthng.org',
    phone: '+234 802 334 5566',
    requests: 'Late check-in around 10:00 PM.',
    paymentPref: 'Pay at hotel',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    total: 435000,
  },
];

let contactsStore = [
  {
    id: 'MSG-A1',
    name: 'Emeka Nwosu',
    email: 'emeka@example.com',
    phone: '+234 809 112 2334',
    message: 'Hello, I want to book the Grand Horizon Ballroom for an executive corporate conference next month.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'New',
  },
  {
    id: 'MSG-A2',
    name: 'Amina Bello',
    email: 'amina@example.com',
    phone: '+234 814 556 7788',
    message: 'Can I request early check-in at 10 AM for the Executive Suite?',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'Replied',
  },
];

// Active Server-Side Session Tokens
const activeTokens = new Map<string, { username: string; email: string; name: string; expiresAt: number }>();

// Authorized administrator credentials
const VALID_ADMINS = [
  {
    emails: ['egutudanny6@gmail.com', 'admin@havenstay.com', 'admin', 'manager'],
    name: 'Danny Egutu (Executive Manager)',
    email: 'egutudanny6@gmail.com',
    role: 'Super Admin',
  },
];

const VALID_PASSWORDS = [
  'HavenStay2026!',
  'admin1234',
  'havenstayhotels',
  'Admin2026!',
];

// Authentication Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization required. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeTokens.get(token);

  if (!session) {
    return res.status(401).json({ success: false, message: 'Invalid or expired administrator session.' });
  }

  if (Date.now() > session.expiresAt) {
    activeTokens.delete(token);
    return res.status(401).json({ success: false, message: 'Administrator session expired. Please sign in again.' });
  }

  (req as any).adminUser = session;
  next();
}

// ==========================================
// 1. ADMIN AUTHENTICATION API ENDPOINTS
// ==========================================

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { emailOrUsername, password } = req.body;
  const cleanInput = (emailOrUsername || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanInput || !cleanPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both administrator email and password.',
    });
  }

  const authorized = VALID_ADMINS.find((admin) =>
    admin.emails.some((e) => e.toLowerCase() === cleanInput)
  );

  const passwordValid = VALID_PASSWORDS.includes(cleanPassword);

  if (!authorized || !passwordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrator credentials. Access restricted to authorized personnel.',
    });
  }

  // Generate secure session token (24-hour expiration)
  const token = 'HS-ADMIN-' + crypto.randomBytes(32).toString('hex');
  const sessionData = {
    username: authorized.email,
    email: authorized.email,
    name: authorized.name,
    role: authorized.role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  activeTokens.set(token, sessionData);

  return res.json({
    success: true,
    token,
    user: {
      username: authorized.email,
      email: authorized.email,
      name: authorized.name,
      role: authorized.role,
    },
  });
});

// GET /api/admin/verify
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  const session = activeTokens.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({ valid: false });
  }
  return res.json({ valid: true, user: session });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// 2. ADMIN RESERVATIONS MANAGEMENT API
// ==========================================

// GET /api/admin/reservations
app.get('/api/admin/reservations', requireAdminAuth, async (req, res) => {
  const scriptUrl = process.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbzqG6y5pbnm59u-7j0FGZX35rezq_nhmxEECXVAhYLNxNEILaar_VZfJgdUX-YN5SDa/exec';
  if (scriptUrl) {
    try {
      const scriptRes = await fetch(`${scriptUrl}?action=bookings`);
      if (scriptRes.ok) {
        const scriptData: any = await scriptRes.json();
        if (scriptData && Array.isArray(scriptData.reservations) && scriptData.reservations.length > 0) {
          const existingRefs = new Set(reservationsStore.map((r) => r.bookingRef));
          for (const item of scriptData.reservations) {
            if (!existingRefs.has(item.bookingRef)) {
              reservationsStore.unshift(item);
              existingRefs.add(item.bookingRef);
            }
          }
        }
      }
    } catch {}
  }
  return res.json({
    success: true,
    reservations: reservationsStore,
  });
});

// PATCH /api/admin/reservations/:id (Update status: Confirmed, Rejected, Cancelled)
app.patch('/api/admin/reservations/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status provided.' });
  }

  const booking = reservationsStore.find((b) => b.id === id || b.bookingRef === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Reservation not found.' });
  }

  booking.status = status as any;

  // Relay status update directly to Google Apps Script / Google Sheet
  const scriptUrl = process.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbzqG6y5pbnm59u-7j0FGZX35rezq_nhmxEECXVAhYLNxNEILaar_VZfJgdUX-YN5SDa/exec';
  if (scriptUrl) {
    fetch(`${scriptUrl}?action=update_status&bookingRef=${encodeURIComponent(booking.bookingRef)}&status=${encodeURIComponent(status)}`).catch(() => {});
  }

  return res.json({
    success: true,
    message: `Reservation ${booking.bookingRef} updated to ${status}.`,
    reservation: booking,
  });
});

// POST /api/admin/reservations (Manual Admin Walk-in Booking)
app.post('/api/admin/reservations', requireAdminAuth, (req, res) => {
  const data = req.body;
  const ci = new Date(data.checkIn);
  const co = new Date(data.checkOut);
  const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
  const pricePerNight = Number(data.pricePerNight) || 165000;
  const total = nights * pricePerNight;
  const ref = 'HS-WLK' + crypto.randomBytes(3).toString('hex').toUpperCase();

  const newBooking: BookingRecord = {
    id: ref,
    bookingRef: ref,
    roomId: data.roomId || 'ROOM-101',
    roomName: data.roomName || 'Deluxe King Room',
    pricePerNight,
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
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    total,
  };

  reservationsStore.unshift(newBooking);

  return res.json({
    success: true,
    bookingRef: ref,
    reservation: newBooking,
  });
});

// DELETE /api/admin/reservations/:id
app.delete('/api/admin/reservations/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const idx = reservationsStore.findIndex((b) => b.id === id || b.bookingRef === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Reservation not found.' });
  }
  const removed = reservationsStore.splice(idx, 1)[0];
  return res.json({ success: true, message: `Reservation ${removed.bookingRef} removed.` });
});

// GET /api/admin/stats
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const total = reservationsStore.length;
  const pending = reservationsStore.filter((b) => b.status === 'Pending').length;
  const confirmed = reservationsStore.filter((b) => b.status === 'Confirmed' || b.status === 'Checked-In' || b.status === 'Completed').length;
  const cancelled = reservationsStore.filter((b) => b.status === 'Cancelled' || b.status === ('Rejected' as any)).length;
  const totalRevenue = reservationsStore
    .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  // Approximate occupancy based on 18 rooms capacity
  const activeBookings = reservationsStore.filter((b) => b.status === 'Confirmed');
  const occupancyRate = Math.min(100, Math.round((activeBookings.length / 18) * 100));

  return res.json({
    success: true,
    stats: {
      total,
      pending,
      confirmed,
      cancelled,
      totalRevenue,
      occupancyRate,
      currency: 'NGN',
    },
  });
});

// GET /api/admin/contacts
app.get('/api/admin/contacts', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    contacts: contactsStore,
  });
});

// GET /api/admin/apps-script-url
let activeAppsScriptUrl = process.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzqG6y5pbnm59u-7j0FGZX35rezq_nhmxEECXVAhYLNxNEILaar_VZfJgdUX-YN5SDa/exec';

app.get('/api/admin/apps-script-url', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    url: activeAppsScriptUrl,
    spreadsheetId: '1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM',
  });
});

// POST /api/admin/apps-script-url (Update Google Apps Script URL dynamically)
app.post('/api/admin/apps-script-url', requireAdminAuth, (req, res) => {
  const { url } = req.body;
  if (url && typeof url === 'string' && url.trim().startsWith('http')) {
    activeAppsScriptUrl = url.trim();
    return res.json({ success: true, url: activeAppsScriptUrl, message: 'Google Apps Script URL updated successfully.' });
  }
  return res.status(400).json({ success: false, message: 'Invalid URL provided.' });
});

// POST /api/admin/test-sheet (Test connection and record a ping or test booking)
app.post('/api/admin/test-sheet', requireAdminAuth, async (req, res) => {
  try {
    const targetUrl = req.body.url || activeAppsScriptUrl;
    const testQuery = new URLSearchParams({
      action: 'book',
      bookingRef: 'HS-TEST-' + crypto.randomBytes(2).toString('hex').toUpperCase(),
      roomId: 'ROOM-101',
      roomName: 'Deluxe King Room (Connection Test)',
      pricePerNight: '165000',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      nights: '2',
      roomsCount: '1',
      total: '330000',
      adults: '2',
      children: '0',
      fullName: 'Danny Egutu (Sync Test)',
      email: 'egutudanny6@gmail.com',
      phone: '+234 803 123 4567',
      paymentPref: 'Pay at hotel',
      requests: 'Diagnostic test row from Admin Portal',
    });

    const start = Date.now();
    const fetchRes = await fetch(`${targetUrl}?${testQuery.toString()}`, { redirect: 'follow' });
    const latency = Date.now() - start;
    const bodyText = await fetchRes.text();

    let parsed = null;
    try {
      parsed = JSON.parse(bodyText);
    } catch {}

    return res.json({
      success: fetchRes.ok,
      status: fetchRes.status,
      latency,
      rawResponse: bodyText.slice(0, 300),
      parsed,
      message: fetchRes.ok
        ? `Successfully reached Google Apps Script (${latency}ms). Response: ${bodyText.slice(0, 100)}`
        : `Google Apps Script returned HTTP ${fetchRes.status}`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to Google Apps Script: ' + (err.message || String(err)),
    });
  }
});

// POST /api/admin/sync-sheet (Push all stored reservations to Google Apps Script)
app.post('/api/admin/sync-sheet', requireAdminAuth, async (req, res) => {
  try {
    const targetUrl = req.body.url || activeAppsScriptUrl;
    let synced = 0;
    let errors = 0;

    for (const b of reservationsStore) {
      try {
        const query = new URLSearchParams({
          action: 'book',
          bookingRef: b.bookingRef,
          roomId: b.roomId,
          roomName: b.roomName,
          pricePerNight: String(b.pricePerNight),
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          nights: String(b.nights),
          roomsCount: String(b.roomsCount || 1),
          total: String(b.total),
          adults: String(b.adults),
          children: String(b.children || 0),
          fullName: b.fullName,
          email: b.email,
          phone: b.phone,
          paymentPref: b.paymentPref,
          requests: b.requests || '',
        });
        const r = await fetch(`${targetUrl}?${query.toString()}`, { redirect: 'follow' });
        if (r.ok) synced++;
        else errors++;
      } catch {
        errors++;
      }
    }

    return res.json({
      success: true,
      total: reservationsStore.length,
      synced,
      errors,
      message: `Pushed ${synced} of ${reservationsStore.length} reservations to Google Sheet.`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Sync error: ' + (err.message || String(err)),
    });
  }
});

// ==========================================
// 3. PUBLIC CUSTOMER API ENDPOINTS
// ==========================================

// POST /api/bookings (Public customer reservation submission)
app.post('/api/bookings', async (req, res) => {
  const { roomId, checkIn, checkOut, adults, children, roomsCount: rawRooms, fullName, email, phone, requests, paymentPref } = req.body;

  if (!roomId || !checkIn || !checkOut || !fullName || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Please complete all required reservation fields.' });
  }

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
  const pricePerNight = Number(req.body.pricePerNight) || 80000;
  const roomsCount = Math.max(1, Number(rawRooms) || 1);

  // STRICT PRICING RULE: Room Price Per Night * Number of Nights * Number of Rooms
  // Adults or children NEVER multiply the room price.
  const total = pricePerNight * nights * roomsCount;
  const ref = 'HS-' + crypto.randomBytes(3).toString('hex').toUpperCase();

  const newReservation: BookingRecord = {
    id: ref,
    bookingRef: ref,
    roomId,
    roomName: req.body.roomName || 'HavenStay Luxury Room',
    pricePerNight,
    roomsCount,
    checkIn,
    checkOut,
    nights,
    adults: Number(adults) || 1,
    children: Number(children) || 0,
    fullName,
    email,
    phone,
    requests: requests || '',
    paymentPref: paymentPref || 'Pay at hotel',
    status: 'Pending', // Customer bookings always begin with Pending status
    createdAt: new Date().toISOString(),
    total,
  };

  // Add to shared memory store (Instantly visible in Admin Management Portal!)
  reservationsStore.unshift(newReservation);

  // Asynchronously relay to Google Apps Script
  (async () => {
    try {
      const targetUrl = activeAppsScriptUrl;
      // 1. Send via GET query parameters (bypasses Google Apps Script POST auth redirect)
      const query = new URLSearchParams({
        action: 'book',
        bookingRef: newReservation.bookingRef,
        roomId: newReservation.roomId,
        roomName: newReservation.roomName,
        pricePerNight: String(newReservation.pricePerNight),
        checkIn: newReservation.checkIn,
        checkOut: newReservation.checkOut,
        nights: String(newReservation.nights),
        roomsCount: String(roomsCount),
        total: String(total),
        adults: String(newReservation.adults),
        children: String(newReservation.children || 0),
        fullName: newReservation.fullName,
        email: newReservation.email,
        phone: newReservation.phone,
        paymentPref: newReservation.paymentPref,
        requests: newReservation.requests || '',
      });
      const getRes = await fetch(`${targetUrl}?${query.toString()}`, { redirect: 'follow' });
      const getText = await getRes.text().catch(() => '');
      console.log('Google Apps Script GET relay result:', getRes.status, getText.slice(0, 120));

      // 2. Also try POST with text/plain
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(newReservation),
        redirect: 'follow',
      }).catch(() => {});
    } catch (relayErr) {
      console.warn('Google Apps Script relay notice:', relayErr);
    }
  })();

  return res.json({
    success: true,
    bookingRef: ref,
    nights,
    total,
    status: 'Pending',
    message: 'Your reservation request has been received. Our concierge will review and confirm shortly.',
  });
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  const newContact = {
    id: 'MSG-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    name,
    email,
    phone: phone || '',
    message,
    createdAt: new Date().toISOString(),
    status: 'New',
  };

  contactsStore.unshift(newContact);
  return res.json({ success: true, message: 'Message sent successfully.' });
});

// ==========================================
// 4. FRONTEND SERVING & DEV INTEGRATION
// ==========================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`HavenStay Fullstack Server listening on port ${PORT}`);
  });
}

startServer();
