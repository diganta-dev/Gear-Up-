# GearUp Frontend — API Integration & Documentation

This document maps all frontend components and routes in **GearUp** to their corresponding backend API endpoints.

---

## 🔑 1. Authentication & Session Management

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Registration Form** | `/register`<br>`app/(auth)/_actions/authAction.ts` | `/api/auth/register` | `POST` | Registers a new Customer or Provider account. |
| **Login Form** | `/login`<br>`app/(auth)/_actions/authAction.ts` | `/api/auth/login` | `POST` | Authenticates user credentials and issues `accessToken` & `refreshToken` HTTP-only cookies. |
| **User Profile / Session** | `service/getme.ts` | `/api/auth/me` | `GET` | Fetches current logged-in user profile & role. |
| **Token Refresh** | `service/refreshToken.ts`<br>`proxy.ts` | `/api/auth/refresh-token` | `POST` | Automatically generates a new access token when expired. |
| **Logout Action** | `service/logout.ts`<br>`Navbar` & `DashboardShell` | Cookie Clearing | `LOCAL` | Clears authentication cookies and redirects to `/login`. |

---

## 👤 2. Profile Management

| Feature / Component | Frontend Component / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Edit Profile** | `app/(dashboard)/profile/components/profile-edit-form.tsx`<br>`service/profile.ts` | `/api/auth/me`<br>`/api/users/me` | `PATCH` / `PUT` | Updates display name and avatar URL. |
| **Change Password** | `app/(dashboard)/profile/components/change-password-form.tsx`<br>`service/profile.ts` | `/api/auth/change-password` | `POST` | Updates current account password. |
| **ImgBB Image Upload** | `components/shered/image-uploader.tsx`<br>`app/api/upload/route.ts` | `https://api.imgbb.com/1/upload` | `POST` | Uploads local images to ImgBB and returns CDN URLs. |

---

## ⚙️ 3. Gear Catalog & Public Browsing

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Featured Gear** | Home (`/`) page<br>`service/gear.ts` | `/api/gear?limit=8` | `GET` | Retrieves top featured gear listings for home landing page. |
| **Browse Gear & Filters** | `/gear`<br>`components/shered/gear-filters.tsx`<br>`service/gear.ts` | `/api/gear` | `GET` | Supports search, category, brand, price range, and availability filtering. |
| **Categories Filter** | `service/gear.ts` | `/api/categories` | `GET` | Fetches list of equipment categories. |
| **Gear Details** | `/gear/[id]`<br>`components/shered/gear-date-picker.tsx`<br>`service/gear.ts` | `/api/gear/:id` | `GET` | Fetches full specification, pricing, availability, and provider info for a gear item. |

---

## 📦 4. Customer Rentals & Checkout Flow

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Rental Date & Checkout** | `/checkout/[id]`<br>`components/shered/checkout-form.tsx`<br>`service/rental.ts` | `/api/rentals` | `POST` | Places a new gear rental order with start & end dates. |
| **Customer Orders** | `/dashboard/orders`<br>`app/(dashboard)/dashboard/components/order-history-table.tsx`<br>`service/rentals.ts` | `/api/rentals` | `GET` | Retrieves current customer's order history and status tracking. |
| **Rental Details** | `/dashboard/customer/orders/[id]`<br>`service/rentals.ts` | `/api/rentals/:id` | `GET` | Detailed view of single rental order. |

---

## 💳 5. Payment Integration

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Order Payment** | `/dashboard/customer/orders/[id]/pay`<br>`components/shered/payment-form.tsx`<br>`service/payments.ts` | `/api/payments/initiate`<br>`/api/payments` | `POST` | Initiates SSLCommerz / Stripe checkout gateway redirect for confirmed orders. |
| **Payment Success** | `/payment/success`<br>`components/shered/payment-success-tracker.tsx` | Gateway Redirect | `GET` | Confirms payment success and redirects user to orders. |
| **Payment Cancel** | `/payment/cancel` | Gateway Redirect | `GET` | Handles cancelled or failed payment transactions with retry option. |

---

## ⭐ 6. Customer Reviews

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Leave Review** | `/dashboard/customer/orders/[id]/review`<br>`components/shered/review-form.tsx`<br>`service/reviews.ts` | `/api/reviews` | `POST` | Submits rating (1-5) & comment for eligible returned gear rentals. |

---

## 🏷️ 7. Provider Dashboard & Inventory Management

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **Provider Inventory** | `/provider-dashboard/inventory`<br>`service/provider-gear.ts` | `/api/provider/gear`<br>`/api/gear` | `GET` | Lists provider's inventory with stock & status. |
| **Add New Gear** | `/provider-dashboard/gear/new`<br>`components/shered/provider-gear-form.tsx`<br>`service/provider-gear.ts` | `/api/gear` | `POST` | Creates a new gear equipment listing. |
| **Edit Gear** | `/provider-dashboard/gear/[id]/edit`<br>`components/shered/provider-gear-form.tsx`<br>`service/provider-gear.ts` | `/api/gear/:id`<br>`/api/provider/gear/:id` | `PATCH` / `PUT` | Updates gear specifications, price, stock, or status. |
| **Delete / Archive Gear** | `/provider-dashboard/inventory`<br>`service/provider-gear.ts` | `/api/gear/:id` | `DELETE` / `PATCH` | Deletes unrented gear or archives gear with rental history (`OUT_OF_STOCK`). |
| **Provider Rental Orders** | `/provider-dashboard/orders`<br>`service/rentals.ts` | `/api/provider/orders` | `GET` | Fetches incoming customer orders for provider. |
| **Order Status Transition** | `/provider-dashboard/orders`<br>`service/rentals.ts` | `/api/provider/orders/:id` | `PATCH` | Transitions order status (`PLACED` → `CONFIRMED` → `PICKED_UP` → `RETURNED`). |

---

## 🛡️ 8. Admin Dashboard & Content Moderation

| Feature / Component | Frontend Route / Service | Backend Endpoint | HTTP Method | Description |
|---|---|---|---|---|
| **User Management** | `/admin-dashboard/users`<br>`service/admin.ts` | `/api/users`<br>`/api/admin/users` | `GET` | Lists all registered platform users. |
| **User Status & Role** | `/admin-dashboard/users`<br>`service/admin.ts` | `/api/users/:id` | `PATCH` | Suspends/activates users or modifies user role (`CUSTOMER`, `PROVIDER`, `ADMIN`). |
| **Gear Moderation** | `/admin-dashboard/gear`<br>`service/admin.ts` | `/api/gear`<br>`/api/admin/gear/:id` | `GET` / `DELETE` | Moderates or archives listed equipment. |
| **Platform Orders** | `/admin-dashboard/orders`<br>`service/admin.ts` | `/api/admin/rentals` | `GET` | Monitors all platform rental transactions. |

---

## ⚠️ 9. UI Error Handling & User Feedback Strategy

- **Toast Notifications**: Built with `sonner` for immediate feedback on API success/error states (e.g., successful profile update, bad credentials, payment errors).
- **Inline Form Validation**: Built using `react-hook-form` + `zod` resolvers to display immediate structured validation errors before API submission.
- **Error Boundaries**: Implemented via Next.js `app/error.tsx` to gracefully catch and display runtime or network errors with a structured "Try Again" recovery action.
- **Empty & Loading States**: Skeleton placeholders and structured `empty-state.tsx` components are displayed when API responses yield empty or null datasets.
