// Complete Google Apps Script source code for HavenStay Hotels
export const CODE_GS_CONTENT = `/**
 * ============================================================================
 * HavenStay Hotels - Google Apps Script Web App
 * Target Spreadsheet URL: https://docs.google.com/spreadsheets/d/1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM/edit
 * Target Spreadsheet ID: 1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM
 * Hotel Admin Email: egutudanny6@gmail.com
 * ============================================================================
 */

const SPREADSHEET_ID = '1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM';
const HOTEL_EMAIL = 'egutudanny6@gmail.com';

function getSpreadsheet_() {
  const ids = [
    '1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM',
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

  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  throw new Error('Could not open spreadsheet ID: 1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqpIHM.');
}

function getOrCreateSheet_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    if (sheetName === 'Bookings') {
      var sheet1 = ss.getSheetByName('Sheet1');
      if (sheet1) {
        try {
          sheet = sheet1.setName('Bookings');
        } catch (renameErr) {
          sheet = sheet1;
        }
      }
    }
    
    if (!sheet) {
      try {
        sheet = ss.insertSheet(sheetName);
      } catch (insertErr) {
        sheet = ss.getSheets()[0];
      }
    }
  }

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

function setup() {
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
  getOrCreateSheet_(ss, 'Bookings', bookingsHeaders);

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

  if (roomsSheet.getLastRow() <= 1) {
    const defaultRooms = [
      ['ROOM-101', 'Deluxe King Room', 'Deluxe', 165000, 3, '1 California King Bed', '38 m²', true, 'Refined elegance meets quiet luxury in Victoria Island.', 'High-Speed Wi-Fi, Climate Control, King Bed, Smart 4K TV, Rain Shower'],
      ['ROOM-202', 'Executive Suite', 'Executive Suite', 245000, 3, '1 King Bed + 1 Daybed', '54 m²', true, 'Crafted for discerning executives and leisurely retreats.', 'High-Speed Wi-Fi, Executive Lounge Access, Deep Soaking Tub, Dedicated Workspace'],
      ['ROOM-303', 'Haven Premier Penthouse', 'Penthouse', 395000, 4, '2 King Beds', '82 m²', true, 'Our crowning achievement with private Atlantic breeze terrace.', 'Private Terrace, Dedicated Butler Service, Kitchenette, Dual Vanities, Free Valet'],
      ['ROOM-104', 'Superior Double Room', 'Superior', 145000, 2, '1 Queen Bed', '32 m²', true, 'Impeccably tailored comfort with city views.', 'High-Speed Wi-Fi, Walk-In Rain Shower, Mini Bar, Signature Linens']
    ];
    defaultRooms.forEach(function(r) { roomsSheet.appendRow(r); });
    try {
      roomsSheet.autoResizeColumns(1, 10);
    } catch (e) {}
  }

  getOrCreateSheet_(ss, 'Contacts', ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status']);
  getOrCreateSheet_(ss, 'Newsletter', ['Date', 'Email']);

  return 'Setup completed successfully! Your Google Sheet (' + ss.getName() + ') is ready.';
}

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
    if (action === 'bookings' || action === 'reservations') {
      return json_(getBookings_());
    }
    if (action === 'update_status') {
      return json_(updateBookingStatus_(e.parameter));
    }
    if (action === 'delete_booking') {
      return json_(deleteBooking_(e.parameter));
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
  const price = Number(d.pricePerNight) || 165000;
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

  try {
    MailApp.sendEmail({
      to: d.email,
      subject: 'HavenStay Hotels - Reservation Confirmation ' + ref,
      body: 'Dear ' + d.fullName + ',\\n\\nThank you for choosing HavenStay Hotels.\\n\\nYour reservation details:\\n- Booking Reference: ' + ref + '\\n- Room: ' + (d.roomName || 'Luxury Room') + '\\n- Check-In: ' + d.checkIn + '\\n- Check-Out: ' + d.checkOut + '\\n- Nights: ' + nights + '\\n- Rooms: ' + roomsCount + '\\n- Total: NGN ' + total.toLocaleString() + '\\n- Payment: ' + (d.paymentPref || 'Pay at hotel') + '\\n\\nWarm regards,\\nHavenStay Hotels Concierge\\n' + HOTEL_EMAIL
    });
  } catch (emailErr) {}

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

function getBookings_() {
  const ss = getSpreadsheet_();
  var sheet = ss.getSheetByName('Bookings') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, reservations: [] };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var rows = data.slice(1);

  var bookings = rows.map(function(row, idx) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }

    var ref = obj['Booking Reference'] || obj['Reference'] || obj['bookingRef'] || ('HS-ROW' + (idx + 2));
    var rawTotal = obj['Total Amount (NGN)'] || obj['Total Amount'] || obj['Total ($)'] || obj['Total'] || 0;
    var totalVal = Number(String(rawTotal).replace(/[^0-9.]/g, '')) || 0;

    return {
      id: String(ref),
      bookingRef: String(ref),
      roomId: String(obj['Room ID'] || 'ROOM-101'),
      roomName: String(obj['Room Name'] || 'Deluxe King Room'),
      checkIn: formatDateStr_(obj['Check-In']),
      checkOut: formatDateStr_(obj['Check-Out']),
      nights: Number(obj['Nights'] || 1),
      roomsCount: Number(obj['Rooms'] || obj['roomsCount'] || 1),
      adults: Number(obj['Adults'] || 1),
      children: Number(obj['Children'] || 0),
      pricePerNight: Number(String(obj['Nightly Rate (NGN)'] || obj['Price Per Night'] || 0).replace(/[^0-9.]/g, '')) || 0,
      total: totalVal,
      fullName: String(obj['Guest Full Name'] || obj['Full Name'] || 'Guest'),
      email: String(obj['Guest Email'] || obj['Email'] || ''),
      phone: String(obj['Guest Phone'] || obj['Phone'] || ''),
      paymentPref: String(obj['Payment Preference'] || 'Pay at hotel'),
      requests: String(obj['Special Requests'] || ''),
      status: String(obj['Status'] || 'Pending'),
      createdAt: formatDateStr_(obj['Date Created']) || new Date().toISOString()
    };
  });

  return { success: true, reservations: bookings.reverse() };
}

function formatDateStr_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'UTC', 'yyyy-MM-dd');
  }
  return String(val);
}

function updateBookingStatus_(params) {
  params = params || {};
  var ref = params.bookingRef || params.ref || params.id;
  var newStatus = params.status;
  if (!ref || !newStatus) {
    return { success: false, message: 'Missing bookingRef or status' };
  }

  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName('Bookings') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  if (!sheet) return { success: false, message: 'Bookings sheet not found' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var refColIdx = headers.findIndex(function(h) {
    return h === 'Booking Reference' || h === 'Reference' || h === 'bookingRef';
  });
  var statusColIdx = headers.findIndex(function(h) {
    return h === 'Status';
  });

  if (statusColIdx === -1) {
    statusColIdx = headers.length - 1;
  }

  for (var r = 1; r < data.length; r++) {
    var rowRef = refColIdx !== -1 ? String(data[r][refColIdx]).trim() : '';
    if (rowRef === String(ref).trim() || ('HS-ROW' + (r + 1)) === String(ref).trim()) {
      sheet.getRange(r + 1, statusColIdx + 1).setValue(newStatus);
      return { success: true, message: 'Status updated to ' + newStatus, bookingRef: ref };
    }
  }

  return { success: false, message: 'Booking reference not found: ' + ref };
}

function deleteBooking_(params) {
  params = params || {};
  var ref = params.bookingRef || params.ref || params.id;
  if (!ref) return { success: false, message: 'Missing bookingRef' };

  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName('Bookings') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  if (!sheet) return { success: false, message: 'Bookings sheet not found' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var refColIdx = headers.findIndex(function(h) {
    return h === 'Booking Reference' || h === 'Reference' || h === 'bookingRef';
  });

  for (var r = 1; r < data.length; r++) {
    var rowRef = refColIdx !== -1 ? String(data[r][refColIdx]).trim() : '';
    if (rowRef === String(ref).trim() || ('HS-ROW' + (r + 1)) === String(ref).trim()) {
      sheet.deleteRow(r + 1);
      return { success: true, message: 'Reservation removed: ' + ref };
    }
  }

  return { success: false, message: 'Booking reference not found: ' + ref };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
`;
