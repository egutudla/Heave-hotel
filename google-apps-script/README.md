# HavenStay Hotels - Google Apps Script & Sheets Backend

This folder contains the complete, battle-tested Apps Script code from the HavenStay Hotels plan (pages 4, 5, and 6 of the specification).

## Quick Setup Steps

1. **Create your Google Sheet**:
   - Go to [Google Sheets](https://sheets.new)
   - Name it `HavenStay Hotels Bookings`
   - Create 4 tabs with exact names:
     - `Rooms`
     - `Bookings`
     - `Contacts`
     - `Newsletter`

2. **Add Header Rows** (in row 1):
   - **`Rooms`**:
     `RoomID`, `Name`, `Type`, `PricePerNight`, `MaxGuests`, `Amenities`, `ImageURL`, `Active`
   - **`Bookings`**:
     `BookingRef`, `Timestamp`, `RoomID`, `RoomName`, `CheckIn`, `CheckOut`, `Nights`, `Adults`, `Children`, `FullName`, `Email`, `Phone`, `Requests`, `PaymentPref`, `TotalPrice`, `Status`
   - **`Contacts`**:
     `Timestamp`, `Name`, `Email`, `Phone`, `Message`
   - **`Newsletter`**:
     `Timestamp`, `Email`

3. **Install Code**:
   - In your Google Sheet, click **Extensions > Apps Script**
   - Replace any existing code with the contents of `google-apps-script/Code.gs`
   - Update `HOTEL_EMAIL` to your hotel's notification email
   - Click the Save icon (or `Cmd + S` / `Ctrl + S`)

4. **Deploy as Web App**:
   - Click **Deploy > New deployment**
   - Select type: **Web app**
   - Description: `HavenStay API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy**
   - Authorize permissions when prompted
   - Copy the generated Web App URL (`https://script.google.com/macros/s/.../exec`)

5. **Connect to HavenStay Website**:
   - Open `/src/config/api.ts`
   - Set `export const APPS_SCRIPT_URL = 'YOUR_COPIED_URL_HERE';`
