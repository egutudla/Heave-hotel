# HavenStay Hotels — Multi-Application Architecture & Deployment Guide

This project contains two completely independent frontend applications sharing a single unified reservation backend and Google Sheets database:

1. **HavenStay Hotels Customer Website** (`havenstayhotels.com`)
   - Premium customer-facing hotel booking website.
   - Absolutely zero references, links, or buttons to administrative portals.
   - Full booking workflow, suite showcases, dining, pool & bar, gallery, and contact concierge.
   - All customer bookings are assigned `Pending` status and automatically saved to the shared database and Google Sheets.

2. **HavenStay Management Portal** (`manage.havenstayhotels.com`)
   - Independent executive hotel administration console.
   - Midnight charcoal (`#121615`) and Muted gold (`#D5AD72`) luxury design language.
   - 10 full management sections:
     1. Overview (real-time KPIs, pending count, confirmed revenue in ₦ Naira, occupancy %)
     2. Reservations (view, search, filter, Confirm / Reject / Cancel actions, WhatsApp voucher, print)
     3. Room Management (inventory, nightly rates in ₦ Naira, capacities, availability toggle)
     4. Guest Management (profiles, loyalty stay counts, cumulative spend, WhatsApp messaging)
     5. Revenue & Reports (ADR, RevPAR, monthly revenue projections)
     6. Dining Management (menus, pricing, hours for Sofia Restaurant, Palms Pool Bar, In-Room dining)
     7. Events & Offers (seasonal promotions, banquet bookings)
     8. Gallery Management (categorized photo assets)
     9. Website Content & Google Sheets Sync (concierge contact numbers, connection testing)
     10. Settings (administrator profile, staff permissions, password audit)

---

## Accessing the Applications in Development & Preview

The local fullstack dev server runs on port 3000 (`tsx server.ts`):

- **Customer Website**: Visit `http://localhost:3000/`
  - Completely clean customer website with NO admin links in Navbar or Footer.
- **Management Portal**: Visit `http://localhost:3000/admin` (or `http://localhost:3000/?portal=admin`)
  - Standalone login page and management dashboard.

### Authorized Administrator Credentials:
- **Email / Username**: `egutudanny6@gmail.com` (or `admin@havenstay.com` / `admin`)
- **Password**: `HavenStay2026!` or `admin1234`
- **Role**: Super Administrator

---

## Netlify Deployment Instructions

You can deploy both applications from this single GitHub repository to Netlify:

### Deploying the Customer Website (`havenstayhotels.com`):
1. Create a new site in Netlify linked to your GitHub repository.
2. In **Site Configuration**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
3. Map your custom domain: `havenstayhotels.com`.

### Deploying the Management Portal (`manage.havenstayhotels.com`):
1. In Netlify, create a second site pointing to the **same GitHub repository**.
2. Under **Site Configuration** > **Domain Management**, assign:
   - **Custom Domain**: `manage.havenstayhotels.com`
3. Because `manage.havenstayhotels.com` starts with `manage.`, the application automatically loads the **HavenStay Management Portal** as its root landing experience!

---

## Google Sheets & Apps Script Integration
- **Target Spreadsheet ID**: `1fkhddEQzQgAXfwWV8Sw9ypnYvF0osErU8NMhaXqplHM`
- **Google Apps Script Web App**:
  `https://script.google.com/macros/s/AKfycbzqG6y5pbnm59u-7j0FGZX35rezq_nhmxEECXVAhYLNxNEILaar_VZfJgdUX-YN5SDa/exec`
- **Spreadsheet Tabs Required**:
  - `Bookings` (Rename `Sheet1` to `Bookings` if newly created)
  - `Rooms`
  - `Contacts`
  - `Newsletter`
