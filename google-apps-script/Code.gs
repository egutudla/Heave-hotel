/**
 * ============================================================================
 * HavenStay Hotels - Production Google Apps Script Web App
 * Target Spreadsheet URL: https://docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM/edit
 * Target Spreadsheet ID: 1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM
 * Hotel Admin Email: egutudanny6@gmail.com
 * ============================================================================
 * 
 * 30-SECOND SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script (in Tab 8 of your browser).
 * 2. Select all existing code (Ctrl+A / Cmd+A) and Delete it.
 * 3. Copy and paste this ENTIRE file into the editor.
 * 4. Click Save (disk icon or Ctrl+S / Cmd+S).
 * 5. In the toolbar at the top (next to "Debug"), select "setup" from the dropdown.
 * 6. Click the "▶ Run" button.
 *    - If Google asks for authorization:
 *      Click "Review permissions" -> Select your Google account -> Click "Advanced" -> Click "Go to Untitled project (unsafe)" -> Click "Allow".
 * 7. When the execution finishes, look at your Google Sheet (Tab 4):
 *    You will see the 'Bookings', 'Rooms', 'Contacts', and 'Newsletter' tabs with dark green headers!
 * 8. Deploy the update:
 *    Click "Deploy" (top right) -> "Manage deployments" -> Click the Pencil (Edit) ->
 *    Under "Version", choose "New version" -> Click "Deploy" -> Click "Done".
 * ============================================================================
 */

// Exact Spreadsheet ID from your URL:
// docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM/edit
const SPREADSHEET_ID = '1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM';
const HOTEL_EMAIL = 'egutudanny6@gmail.com';

/**
 * Open target Google Spreadsheet with multi-strategy fallback
 */
function getSpreadsheet_() {
  const ids = [
    '1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM', // Capital I (exact match from your URL)
    (typeof SPREADSHEET_ID !== 'undefined' ? SPREADSHEET_ID : '').trim()
  ];

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    if (id && id.length > 10) {
      try {
        var target = SpreadsheetApp.openById(id);
        if (target) return target;
      } catch (err) {
        Logger.log('Could not open spreadsheet by ID ' + id + ': ' + err);
      }
    }
  }

  // Fallback to container-bound spreadsheet if available
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  throw new Error('Could not open spreadsheet ID: 1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM. Please verify edit permissions.');
}

/**
 * Retrieve or create sheet tab and apply headers
 */
function getOrCreateSheet_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    // If the sheet has an empty 'Sheet1' and we need 'Bookings', rename 'Sheet1' so user sees it right away!
    if (sheetName === 'Bookings') {
      var sheet1 = ss.getSheetByName('Sheet1');
      if (sheet1 && sheet1.getLastRow() <= 1) {
        sheet = sheet1.setName('Bookings');
      }
    }
    
    if (!sheet) {
      try {
        sheet = ss.insertSheet(sheetName);
      } catch (insertErr) {
        // If insert fails, use the active or first sheet
        sheet = ss.getSheets()[0];
      }
    }
  }

  // Ensure headers exist on row 1
  if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#142D26')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    try {
      sheet.autoResizeColumns(1, headers.length);
    } catch (resizeErr) {}
  }

  return sheet;
}

/**
 * 1-Click Setup Function: Run this once in Google Apps Script!
 */
function setup() {
  const ss = getSpreadsheet_();

  // 1. Create Bookings Tab
  const bookingsHeaders = [
    'Booking Reference',
    'Date Created',
    'Room ID',
    'Room Name',
    'Check-In',
    'Check-Out',
    'Nights',
    'Rooms',
    'Adults',
    'Children',
    'Nightly Rate (NGN)',
    'Total Amount (NGN)',
    'Guest Full Name',
    'Guest Email',
    'Guest Phone',
    'Payment Preference',
    'Special Requests',
    'Status'
  ];
  getOrCreateSheet_(ss, 'Bookings', bookingsHeaders);

  // 2. Create Rooms Tab
  const roomsSheet = getOrCreateSheet_(ss, 'Rooms', [
    'Room ID',
    'Room Name',
    'Type',
    'Price Per Night (NGN)',
    'Max Guests',
    'Bed Type',
    'Room Size',
    'Active',
    'Description',
    'Amenities'
  ]);

  // Seed default rooms if empty
  if (roomsSheet.getLastRow() <= 1) {
    const defaultRooms = [
      ['ROOM-101', 'Deluxe Room', 'Deluxe', 80000, 3, '1 California King Bed', '38 m²', true, 'Refined elegance meets quiet luxury in Victoria Island.', 'High-Speed Wi-Fi, Climate Control, King Bed, Smart 4K TV, Rain Shower'],
      ['ROOM-202', 'Executive Suite', 'Executive Suite', 145000, 3, '1 King Bed + 1 Daybed', '54 m²', true, 'Crafted for discerning executives and leisurely retreats.', 'High-Speed Wi-Fi, Executive Lounge Access, Deep Soaking Tub, Dedicated Workspace'],
      ['ROOM-303', 'Haven Premier Penthouse', 'Penthouse', 250000, 4, '2 King Beds', '82 m²', true, 'Our crowning achievement with private Atlantic breeze terrace.', 'Private Terrace, Dedicated Butler Service, Kitchenette, Dual Vanities, Free Valet'],
      ['ROOM-104', 'Superior Double Room', 'Superior', 70000, 2, '1 Queen Bed', '32 m²', true, 'Impeccably tailored comfort with city views.', 'High-Speed Wi-Fi, Walk-In Rain Shower, Mini Bar, Signature Linens'],
      ['ROOM-205', 'Family Garden Suite', 'Family Suite', 185000, 5, '1 King + 2 Twin Beds', '68 m²', true, 'Generously proportioned for families and extended stays.', 'Family Living Area, Kitchenette, Garden Terrace, Connecting Options'],
      ['ROOM-106', 'Classic Comfort Suite', 'Classic', 60000, 2, '1 Double Bed', '28 m²', true, 'Warm, intimate sanctuary designed for restful sleep.', 'High-Speed Wi-Fi, Luxury Bath Amenities, Work Desk, Soundproof Windows']
    ];
    defaultRooms.forEach(function(r) { roomsSheet.appendRow(r); });
    try {
      roomsSheet.autoResizeColumns(1, 10);
    } catch (e) {}
  }

  // 3. Create Contacts Tab
  getOrCreateSheet_(ss, 'Contacts', ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status']);

  // 4. Create Newsletter Tab
  getOrCreateSheet_(ss, 'Newsletter', ['Date', 'Email']);

  Logger.log('HavenStay Setup Completed! Connected to Spreadsheet: ' + ss.getName() + ' (' + ss.getId() + ')');
  return 'Setup completed successfully! Your Google Sheet (' + ss.getName() + ') is now ready for live bookings.';
}

/**
 * Handle GET requests (bypasses CORS preflight & auth redirects)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    
    if (action === 'rooms') {
      return json_(getRooms_());
    }
    if (action === 'availability') {
      return json_(isAvailable_(e.parameter.roomId, e.parameter.checkIn, e.parameter.checkOut));
    }
    if (action === 'book') {
      return json_(saveBooking_(e.parameter));
    }
    if (action === 'setup') {
      return json_({ success: true, message: setup() });
    }
    if (action === 'ping') {
      const ss = getSpreadsheet_();
      return json_({
        ok: true,
        hotel: 'HavenStay Hotels',
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); }),
        timestamp: new Date().toISOString()
      });
    }

    return json_({
      ok: true,
      hotel: 'HavenStay Hotels',
      targetSpreadsheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return json_({ ok: false, error: err.toString() });
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    if (data.type === 'contact') {
      return json_(saveContact_(data));
    }
    if (data.type === 'newsletter') {
      return json_(saveNewsletter_(data));
    }
    return json_(saveBooking_(data));
  } catch (err) {
    return json_({ success: false, message: 'Server error: ' + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Save Guest Booking into 'Bookings' Sheet
 */
function saveBooking_(d) {
  d = d || {};
  const required = ['roomId', 'checkIn', 'checkOut', 'fullName', 'email', 'phone'];
  for (var i = 0; i < required.length; i++) {
    var k = required[i];
    if (!d[k]) {
      return { success: false, message: 'Missing required field: ' + k };
    }
  }

  const ss = getSpreadsheet_();
  const bookingsHeaders = [
    'Booking Reference',
    'Date Created',
    'Room ID',
    'Room Name',
    'Check-In',
    'Check-Out',
    'Nights',
    'Rooms',
    'Adults',
    'Children',
    'Nightly Rate (NGN)',
    'Total Amount (NGN)',
    'Guest Full Name',
    'Guest Email',
    'Guest Phone',
    'Payment Preference',
    'Special Requests',
    'Status'
  ];
  const sheet = getOrCreateSheet_(ss, 'Bookings', bookingsHeaders);

  const ci = new Date(d.checkIn);
  const co = new Date(d.checkOut);
  const diffTime = co.getTime() - ci.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const price = Number(d.pricePerNight) || 80000;
  const roomsCount = Math.max(1, Number(d.roomsCount) || 1);
  const total = Number(d.total) || (nights * price * roomsCount);
  const ref = d.bookingRef || ('HS-' + Utilities.getUuid().slice(0, 6).toUpperCase());
  const now = new Date();

  sheet.appendRow([
    ref,
    now,
    d.roomId,
    d.roomName || 'HavenStay Luxury Room',
    d.checkIn,
    d.checkOut,
    nights,
    roomsCount,
    Number(d.adults) || 1,
    Number(d.children) || 0,
    price,
    total,
    d.fullName,
    d.email,
    d.phone,
    d.paymentPref || 'Pay at hotel',
    d.requests || '',
    d.status || 'Confirmed'
  ]);

  try {
    sheet.autoResizeColumns(1, bookingsHeaders.length);
  } catch (e) {}

  // Optional: Send guest confirmation email
  try {
    MailApp.sendEmail({
      to: d.email,
      subject: 'HavenStay Hotels - Reservation Confirmation ' + ref,
      body: 'Dear ' + d.fullName + ',\n\nThank you for choosing HavenStay Hotels.\n\nYour reservation details:\n- Booking Reference: ' + ref + '\n- Room: ' + (d.roomName || 'Luxury Room') + '\n- Check-In: ' + d.checkIn + '\n- Check-Out: ' + d.checkOut + '\n- Number of Nights: ' + nights + '\n- Number of Rooms: ' + roomsCount + '\n- Total Amount: NGN ' + total.toLocaleString() + '\n- Payment Preference: ' + (d.paymentPref || 'Pay at hotel') + '\n\nOur concierge team will have everything prepared for your arrival.\n\nWarm regards,\nHavenStay Hotels Concierge\nVictoria Island, Lagos\n' + HOTEL_EMAIL
    });
  } catch (emailErr) {
    Logger.log('Email notice: ' + emailErr);
  }

  return {
    success: true,
    bookingRef: ref,
    nights: nights,
    roomsCount: roomsCount,
    total: total,
    message: 'Booking confirmed and recorded in Google Sheet!'
  };
}

function getRooms_() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Rooms');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function isAvailable_(roomId, checkIn, checkOut) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Bookings');
  if (!sheet || sheet.getLastRow() <= 1) return { available: true };
  const rows = sheet.getDataRange().getValues();
  const ci = new Date(checkIn), co = new Date(checkOut);
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[2]) === String(roomId) && String(row[17]) !== 'Cancelled') {
      var bci = new Date(row[4]), bco = new Date(row[5]);
      if (ci < bco && co > bci) return { available: false, message: 'Room already reserved for selected dates.' };
    }
  }
  return { available: true };
}

function saveContact_(d) {
  const ss = getSpreadsheet_();
  const sheet = getOrCreateSheet_(ss, 'Contacts', ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status']);
  sheet.appendRow([new Date(), d.name, d.email, d.phone, d.message, 'New']);
  return { success: true };
}

function saveNewsletter_(d) {
  const ss = getSpreadsheet_();
  const sheet = getOrCreateSheet_(ss, 'Newsletter', ['Date', 'Email']);
  sheet.appendRow([new Date(), d.email]);
  return { success: true };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
