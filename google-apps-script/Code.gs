/**
 * ============================================================================
 * HavenStay Hotels - Google Apps Script Backend
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) and create a new spreadsheet.
 * 2. Create 4 tabs with the exact names:
 *    - "Rooms"
 *    - "Bookings"
 *    - "Contacts"
 *    - "Newsletter"
 * 
 * 3. In Row 1 of each tab, paste the headers:
 *    - Tab "Rooms":
 *      RoomID | Name | Type | PricePerNight | MaxGuests | Amenities | ImageURL | Active
 * 
 *    - Tab "Bookings":
 *      BookingRef | Timestamp | RoomID | RoomName | CheckIn | CheckOut | Nights | Adults | Children | FullName | Email | Phone | Requests | PaymentPref | TotalPrice | Status
 * 
 *    - Tab "Contacts":
 *      Timestamp | Name | Email | Phone | Message
 * 
 *    - Tab "Newsletter":
 *      Timestamp | Email
 * 
 * 4. Go to Extensions > Apps Script in your spreadsheet.
 * 5. Delete any existing code, paste this entire file, and click Save (Ctrl+S / Cmd+S).
 * 6. Change HOTEL_EMAIL below to your real hotel notification email.
 * 7. Click Deploy > New deployment > Select type "Web app":
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Click Deploy, Authorize access, and copy the Web App URL (ends in /exec).
 * 9. Paste that URL into src/config/api.ts at APPS_SCRIPT_URL.
 * ============================================================================
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const HOTEL_EMAIL = 'concierge@havenstayhotels.com'; // Change this to your hotel email address

/**
 * Handle GET requests for rooms list and date availability checks
 */
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'rooms') {
    return json_(getRooms_());
  }
  if (action === 'availability') {
    return json_(isAvailable_(e.parameter.roomId, e.parameter.checkIn, e.parameter.checkOut));
  }
  return json_({ ok: true, hotel: 'HavenStay Hotels' });
}

/**
 * Handle POST requests for bookings, contact form submissions, and newsletter subscriptions
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // 20 second lock to prevent race conditions & double-bookings
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'contact') {
      return json_(saveContact_(data));
    }
    if (data.type === 'newsletter') {
      return json_(saveNewsletter_(data));
    }
    return json_(saveBooking_(data));
  } catch (err) {
    return json_({ success: false, message: 'Server busy or error: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Validate and save a guest reservation
 */
function saveBooking_(d) {
  const required = ['roomId', 'checkIn', 'checkOut', 'adults', 'fullName', 'email', 'phone'];
  for (const k of required) {
    if (!d[k]) return { success: false, message: 'Missing field: ' + k };
  }

  const ci = new Date(d.checkIn);
  const co = new Date(d.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(ci.getTime()) || isNaN(co.getTime()) || ci < today || co <= ci) {
    return { success: false, message: 'Please choose valid dates (check-out must be after check-in, not in the past).' };
  }

  if (!/^\S+@\S+\.\S+$/.test(d.email)) {
    return { success: false, message: 'Invalid email address provided.' };
  }

  const rooms = getRooms_();
  const room = rooms.find(r => String(r.RoomID) === String(d.roomId));
  if (!room) {
    return { success: false, message: 'Room not found.' };
  }

  if (Number(d.adults) + Number(d.children || 0) > Number(room.MaxGuests)) {
    return { success: false, message: 'Too many guests for this room (Max: ' + room.MaxGuests + ').' };
  }

  // Server-side double-booking check
  const avail = isAvailable_(d.roomId, d.checkIn, d.checkOut);
  if (!avail.available) {
    return { success: false, message: 'Sorry, this room is no longer available for those dates.' };
  }

  const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86400000));
  const total = nights * Number(room.PricePerNight);
  const ref = 'HS-' + Utilities.getUuid().slice(0, 6).toUpperCase();

  const sheet = SS.getSheetByName('Bookings');
  sheet.appendRow([
    ref,
    new Date(),
    room.RoomID,
    room.Name,
    d.checkIn,
    d.checkOut,
    nights,
    d.adults,
    d.children || 0,
    d.fullName,
    d.email,
    d.phone,
    d.requests || '',
    d.paymentPref || 'Pay at hotel',
    total,
    'Pending'
  ]);

  // Send confirmation email to guest
  try {
    MailApp.sendEmail(
      d.email,
      'HavenStay Hotels - Reservation received (' + ref + ')',
      'Dear ' + d.fullName + ',\n\n' +
      'Thank you for choosing HavenStay Hotels.\n\n' +
      'Reference: ' + ref + '\n' +
      'Room: ' + room.Name + '\n' +
      'Check-in: ' + d.checkIn + '\n' +
      'Check-out: ' + d.checkOut + '\n' +
      'Nights: ' + nights + '\n' +
      'Total: $' + total + '\n\n' +
      'We will contact you shortly to confirm your stay.\n\n' +
      'Your Comfort, Our Priority.\nHavenStay Hotels Team'
    );
  } catch (e) {
    Logger.log('Could not send guest email: ' + e);
  }

  // Alert hotel staff
  try {
    MailApp.sendEmail(
      HOTEL_EMAIL,
      'New booking request ' + ref,
      d.fullName + ' | ' + d.phone + ' | ' + room.Name + ' | ' + d.checkIn + ' to ' + d.checkOut + ' | Total: $' + total
    );
  } catch (e) {
    Logger.log('Could not send hotel email: ' + e);
  }

  return { success: true, bookingRef: ref, nights: nights, total: total };
}

/**
 * Check if a room is booked for overlapping dates
 */
function isAvailable_(roomId, checkIn, checkOut) {
  const sheet = SS.getSheetByName('Bookings');
  if (!sheet) return { available: true };

  const rows = sheet.getDataRange().getValues();
  const ci = new Date(checkIn);
  const co = new Date(checkOut);

  for (let i = 1; i < rows.length; i++) {
    const [ref, , rid, , bci, bco, , , , , , , , , , status] = rows[i];
    if (String(rid) !== String(roomId) || status === 'Cancelled') continue;
    if (ci < new Date(bco) && co > new Date(bci)) {
      return { available: false, message: 'Sorry, this room is no longer available for those dates.' };
    }
  }
  return { available: true };
}

/**
 * Retrieve active rooms from the Rooms sheet
 */
function getRooms_() {
  const sheet = SS.getSheetByName('Rooms');
  if (!sheet) return [];
  const v = sheet.getDataRange().getValues();
  if (v.length <= 1) return [];
  const h = v.shift();
  return v
    .map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
    .filter(r => r.Active === true || r.Active === 'TRUE' || r.Active === 'true');
}

/**
 * Save contact inquiries
 */
function saveContact_(d) {
  const sheet = SS.getSheetByName('Contacts');
  if (sheet) {
    sheet.appendRow([new Date(), d.name, d.email, d.phone, d.message]);
  }
  return { success: true };
}

/**
 * Save newsletter subscriptions
 */
function saveNewsletter_(d) {
  const sheet = SS.getSheetByName('Newsletter');
  if (sheet) {
    sheet.appendRow([new Date(), d.email]);
  }
  return { success: true };
}

/**
 * JSON helper response
 */
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
