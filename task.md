# Task Management

## Active Tasks (from current session)
- [x] Implement Push Notifications
    - [x] Install `web-push`
    - [x] Generate VAPID Keys
    - [x] Create `push_subscriptions` table migration
    - [x] Create `public/sw.js`
    - [x] Implement `src/actions/notification.ts`
    - [x] Update `NotificationBanner` component
    - [x] Integrate with Product Creation
- [x] Implement Notification Center
    - [x] Create `app_notifications` table
    - [x] Update server actions for history
    - [x] Create `NotificationCenter` UI component
    - [x] Install UI dependencies (popover)
    - [x] Add to Header
- [x] Implement User Account Settings
    - [x] Create server action `src/actions/account.ts`
    - [x] Create form component `src/components/features/account/account-form.tsx`
    - [x] Create page `src/app/account/page.tsx`
    - [x] Add Settings link to `Header`
- [x] UI Refinements (Mobile Optimization)
    - [x] Header Responsiveness
    - [x] Product Search (Tag UI cleanup)
    - [x] Product List Layout (Mobile 1-col)
- [x] Assessment Campaign Features
    - [x] Backend & Admin Config
    - [x] Public Assessment Page (Share button, Countdown, DM link)
    - [x] Campaign Details Page
    - [x] Assessment Form UI Refinement
- [x] Deployment & Polish
    - [x] Remove email from mobile menu
    - [x] Use User ID (email local part) in Header/Menu
    - [x] Simplify Account Settings Helper Text
    - [x] Deploy to Production (Vercel CLI)

## Planned Features (Differentiation)
- [ ] Top Page Slider/Carousel
    - [ ] Implement Slider for "New Arrivals" (Stock)
    - [ ] Implement Slider for "Notifications/Announcements"
- [ ] Customer Review System
    - [ ] Database Schema (`reviews` table: star, comment, date, manual_stock_no, manual_price)
    - [ ] Admin: Manage Reviews (Create/Edit/Delete) - Allow manual entry of Stock No/Price
    - [ ] Public: Review List Page (`/reviews`)
    - [ ] UI: Star Rating Component (with "Very Good" badge for 4+ stars)

---

## Completed History (Phase 1)
- [x] Product Management (List, Create, Edit, Delete, Tags)
- [x] Authentication (Admin Protect, Login)
- [x] Site Settings (Config, Terms, Contact)
- [x] Assessment Rules Management (Admin CRUD)
- [x] Public Views (List, Detail, Search)
- [x] Assessment Form (Real-time Calc, UI)
- [x] Initial Deployment (Vercel Configuration)
