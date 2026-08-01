# GearUp Frontend — Professional Part-by-Part Development Prompt

You are a senior frontend developer specializing in Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, secure authentication, role-based dashboards, and frontend API integration.

Your task is to complete my **GearUp Frontend Assignment** professionally, but you must work **strictly part by part**.

## Project Overview

GearUp is a sports and outdoor equipment rental platform.

Main roles:

* Customer
* Provider
* Admin

The frontend will consume my existing backend API.

## Current Project Status

The Next.js project is already created.

Already completed:

* Basic project setup
* Folder structure
* Login functionality
* Authentication proxy file
* Route protection foundation
* Access token and refresh token handling

Not completed:

* Registration
* Public gear pages
* Customer dashboard
* Provider dashboard
* Admin dashboard
* Rental flow
* Payment flow
* Review flow
* Remaining UI states and integrations

Before writing code, inspect the existing project carefully.

Do not recreate or unnecessarily replace working code.

---

# Critical Working Rule

You must complete the project in separate parts.

You are allowed to work on **only one part at a time**.

After completing a part:

1. Stop all development.
2. Do not start the next part.
3. Show a clear completion report.
4. Tell me which files were created, modified, or deleted.
5. Explain how I can manually test the completed part.
6. Suggest one professional Git commit message.
7. End with exactly:

**Part [number] completed. Please review, test, and commit the changes. Give me permission before I start Part [next number].**

You must wait for my permission before starting another part.

Never assume permission.

Never continue automatically.

---

# Development Standards

Write code like an experienced human frontend developer.

The code must not look unnecessarily AI-generated.

Follow these rules:

* Use clean and meaningful variable names.
* Keep functions focused and readable.
* Avoid unnecessary abstraction.
* Avoid excessive comments.
* Add comments only where the logic is genuinely difficult.
* Reuse existing utilities and components.
* Avoid duplicated code.
* Keep components reasonably small.
* Separate server and client responsibilities correctly.
* Use TypeScript properly.
* Avoid `any` unless absolutely necessary.
* Define reusable types and interfaces.
* Handle loading, error, empty, success, and disabled states.
* Use accessible labels and semantic HTML.
* Keep the UI responsive.
* Follow the existing project design system.
* Do not introduce packages without a valid reason.
* Do not modify unrelated files.
* Do not rewrite working authentication code unless a real issue exists.
* Do not expose secrets or sensitive tokens in client-side code.
* Do not hardcode backend URLs.
* Use environment variables for API base URLs.
* Do not use mock data when the real backend endpoint is available.
* If an endpoint is unavailable, isolate temporary mock data clearly.

Use the existing package manager and coding style found in the project.

Before installing a package, verify whether an equivalent package already exists.

---

# Technology Expectations

Use the technologies already available in the project where appropriate:

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* Sonner or the existing toast library
* Next.js Image
* Server Components
* Client Components only where interactivity is required
* Existing authentication and API utilities
* TanStack Query only if already installed or clearly beneficial

Do not add Redux unless the project genuinely requires it.

---

# Existing Authentication Rules

The login flow and proxy are already implemented.

Inspect the existing implementation before making changes.

Authentication requirements:

* Preserve the existing login system.
* Preserve access-token and refresh-token logic.
* Use the existing cookie strategy.
* Never read an HTTP-only token using `document.cookie`.
* Protect role-based dashboard routes.
* Redirect unauthenticated users to the login page.
* Redirect authenticated users away from login and registration pages when appropriate.
* Prevent users from accessing dashboards that do not match their role.
* Do not use `Bearer` unless the existing backend API explicitly requires it.
* Follow the project’s current token format and request strategy.

---

# Required Project Parts

## Part 1 — Project Audit and Shared Foundation

Inspect the complete frontend project.

Tasks:

* Review the existing folder structure.
* Review login implementation.
* Review proxy implementation.
* Review token and refresh-token utilities.
* Review API service structure.
* Review existing layouts and reusable components.
* Review environment variable usage.
* Identify build errors, type errors, broken imports, and inconsistent naming.
* Confirm whether the project currently uses routes such as `/login` or `/auth/login`.
* Create or improve shared TypeScript types where necessary.
* Create or improve the central API configuration.
* Add shared constants for roles and rental statuses.
* Add reusable rental-status badge utilities.
* Add reusable loading, empty-state, and error-state components only if missing.
* Do not build registration or feature pages in this part.

At the end, provide an audit summary and stop.

---

## Part 2 — Registration and Authentication UI Completion

Build the registration flow.

Requirements:

* Registration form
* Name field
* Email field
* Password field
* Confirm-password field if appropriate
* Role selection for Customer or Provider
* Proper validation
* Password visibility toggle
* Loading state
* Backend validation error display
* Success toast
* Redirect after successful registration
* Link to login page
* Responsive design
* Accessible form controls

Use the backend registration endpoint already available in the project.

Do not allow users to register directly as Admin unless the backend explicitly supports it.

Update proxy/auth route configuration if registration is not currently handled correctly.

Stop after registration is working.

---

## Part 3 — Public Layout and Home Page

Build the professional public-facing application layout.

Requirements:

* Responsive navbar
* Mobile menu
* Logo or text-based GearUp brand
* Home link
* Browse Gear link
* Authentication actions
* Role-aware dashboard link
* User dropdown when authenticated
* Logout functionality using the existing auth strategy
* Professional footer

Home page sections:

* Hero section
* Search or browse CTA
* Featured gear section
* Popular categories section
* “How GearUp Works” section
* Customer and provider benefits
* Trust or service highlights
* Final CTA section

Consume `GET /api/gear` for featured gear.

Use proper loading, empty, and error states.

Stop after the public layout and home page are complete.

---

## Part 4 — Gear Listing, Search, and Filters

Build the `/gear` page.

Requirements:

* Responsive gear grid
* Gear cards using `next/image`
* Name
* Category
* Brand
* Price per day
* Availability status
* Details CTA
* Search by name or keyword
* Category filter
* Brand filter
* Minimum and maximum price filters
* Availability filter
* Clear-filters action
* Pagination if supported by the backend
* URL query parameter synchronization where practical
* Mobile filter drawer
* Desktop filter sidebar or toolbar
* Skeleton loading
* Empty search results state
* API error state

Consume:

* `GET /api/gear`
* `GET /api/categories`

Map filters to the actual backend query parameters.

Stop after the browse and filtering experience is complete.

---

## Part 5 — Gear Details and Rental Date Selection

Build `/gear/[id]`.

Requirements:

* Gear image gallery
* Gear name
* Description
* Price per day
* Category
* Brand
* Specifications
* Stock or availability information
* Provider information
* Review summary if supported
* Rental date picker
* Start date
* End date
* Rental duration calculation
* Estimated total price
* Rent Now CTA

Date-selection rules:

* Prevent past dates.
* Prevent end dates before start dates.
* Prevent invalid or unavailable dates where backend data permits.
* Show clear validation errors.
* Disable submission while processing.

Unauthenticated users should be redirected to login before placing a rental.

Stop after the details page and date-selection UI are complete.

---

## Part 6 — Customer Rental Checkout Flow

Build the customer rental checkout process.

Requirements:

* Confirm selected gear
* Confirm start and end dates
* Display number of rental days
* Display daily price
* Display calculated total
* Customer details summary
* Order creation action
* Confirmation state
* Error handling
* Prevent duplicate submissions

Use the real backend rental endpoint.

After successful creation:

* Redirect to the customer order details page, or
* Redirect to the appropriate payment page depending on backend behavior

Stop after rental order creation works.

---

## Part 7 — Customer Dashboard and Order History

Build `/dashboard/customer`.

Requirements:

* Customer dashboard layout
* Overview cards
* Total orders
* Active rentals
* Completed rentals
* Total payments where supported
* Order history table or responsive cards
* Status badges
* Order details link
* Pay Now action when status is `CONFIRMED`
* Leave Review action when status is `RETURNED`
* Empty state
* Loading state
* Error state

Status badge rules:

* `PLACED` → Yellow or orange
* `CONFIRMED` → Blue
* `PAID` → Purple
* `PICKED_UP` → Green
* `RETURNED` → Gray
* `CANCELLED` → Red

Consume:

* `GET /api/rentals`
* `GET /api/payments`

Stop after the customer dashboard is complete.

---

## Part 8 — Payment Integration UI

Build the payment flow.

Required routes:

* `/dashboard/customer/orders/[id]/pay`
* `/payment/success`
* `/payment/cancel`

Requirements:

* Order summary
* Payable amount
* Payment-provider indication
* Secure payment CTA
* Loading state during payment initiation
* Duplicate-payment prevention
* Redirect to Stripe Checkout or SSLCommerz
* Success page with useful payment feedback
* Cancel page with retry action
* Safely process URL query parameters
* Never expose secret payment keys in frontend code

Consume the backend payment creation endpoint.

Stop after the payment UI and redirects are working.

---

## Part 9 — Customer Review Flow

Build the review-submission experience.

Requirements:

* Only show review action for eligible returned orders.
* Rating selector
* Written comment field
* Validation
* Submit loading state
* Success toast
* Error feedback
* Prevent duplicate review submission if the backend supports this rule
* Refresh or invalidate related gear/review data after submission

Stop after the review flow is complete.

---

## Part 10 — Provider Dashboard and Inventory Management

Build `/dashboard/provider`.

Requirements:

* Provider dashboard layout
* Total gear count
* Active rentals
* Pending orders
* Revenue or payment statistics if supported
* Inventory list
* Add Gear action
* Edit Gear action
* Delete Gear action
* Delete confirmation dialog
* Availability toggle
* Stock information
* Responsive mobile UI

Build:

* `/dashboard/provider/gear/new`
* Appropriate edit route such as `/dashboard/provider/gear/[id]/edit`

Gear form fields should include:

* Name
* Description
* Category
* Brand
* Price per day
* Stock
* Image URL or backend-compatible image field
* Specifications
* Availability status

Consume the actual provider gear endpoints.

Stop after provider inventory CRUD is complete.

---

## Part 11 — Provider Order Management

Build `/dashboard/provider/orders`.

Requirements:

* Incoming orders table
* Search or filter where useful
* Customer information
* Gear information
* Rental dates
* Total amount
* Payment status
* Rental status
* Context-aware action buttons

Allowed UI actions should follow valid transitions:

* `PLACED` → Confirm
* `PAID` → Mark Picked Up
* `PICKED_UP` → Mark Returned
* Appropriate cancellation action if supported

Requirements:

* Confirmation dialogs for sensitive actions
* Loading state per action
* Toast feedback
* Optimistic update or query invalidation
* Prevent invalid status transitions
* Refresh the table without a full browser reload

Stop after provider order management works.

---

## Part 12 — Admin Dashboard and User Management

Build `/dashboard/admin`.

Requirements:

* Total users
* Total customers
* Total providers
* Active gear
* Total rentals
* Platform overview
* User management table
* Search
* Pagination
* Role display
* Account status display
* Suspend action
* Activate action
* Confirmation dialog
* Loading states
* Error states
* Responsive design

Use the actual admin endpoints.

Do not expose admin actions to non-admin users.

Stop after user management is complete.

---

## Part 13 — Admin Content Moderation

Build admin moderation views.

Requirements:

* View all gear listings
* Inspect gear details
* View all rental orders
* Filter by rental status
* View provider and customer information
* Remove or disable listings only if the backend supports it
* Handle moderation actions safely
* Add confirmation dialogs
* Add success and failure toast notifications

Stop after the moderation interface is complete.

---

## Part 14 — Final UI Polish and Quality Assurance

Perform a complete frontend quality review.

Tasks:

* Run linting.
* Run TypeScript checking.
* Run the production build.
* Fix build errors.
* Fix hydration errors.
* Fix broken links.
* Fix incorrect route redirects.
* Verify mobile responsiveness.
* Verify tablet responsiveness.
* Verify desktop responsiveness.
* Check keyboard navigation.
* Check labels and accessibility basics.
* Check image optimization.
* Check loading states.
* Check empty states.
* Check error states.
* Check role-based route protection.
* Check direct URL access.
* Check refresh-token behavior.
* Remove unused imports.
* Remove dead code.
* Remove unnecessary console logs.
* Ensure environment variables are documented.
* Ensure no secret is committed.
* Add or update the README setup instructions.

Do not redesign the entire project during this part.

Stop after the final audit is complete.

---

# Rental Status Transition Rules

Use backend rules as the source of truth.

The expected frontend flow is:

```text
PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED
```

Possible alternative final state:

```text
PLACED / CONFIRMED → CANCELLED
```

Never show an action button that would cause an invalid transition.

---

# Route Protection Expectations

The UI and route protection must follow these rules:

## Public Routes

* `/`
* `/gear`
* `/gear/[id]`
* Login route
* Registration route
* Payment success/cancel routes when required by the gateway

## Customer Routes

* `/dashboard/customer`
* Customer orders
* Payment initiation
* Review submission

## Provider Routes

* `/dashboard/provider`
* Provider inventory
* Add/edit gear
* Provider order management

## Admin Routes

* `/dashboard/admin`
* User management
* Content moderation

Do not rely only on hiding links.

Protect routes using the existing proxy or middleware strategy.

---

# API Integration Rules

Before implementing a feature:

1. Inspect existing service files.
2. Inspect the backend response shape if available.
3. Reuse the existing API client.
4. Do not guess endpoint names when the project already contains them.
5. Keep API logic outside large UI components.
6. Normalize backend errors into user-friendly messages.
7. Correctly handle `401`, `403`, `404`, validation errors, and server errors.
8. Use request caching intentionally.
9. Avoid stale dashboard data after mutations.
10. Never hardcode fake success responses.

When an endpoint or response shape is unclear, inspect the existing backend or frontend types before writing code.

---

# UI Design Direction

The design should feel:

* Modern
* Professional
* Sports-focused
* Trustworthy
* Clean
* Responsive
* Production-ready

Avoid:

* Excessive gradients
* Too many animations
* Giant text on every page
* Inconsistent spacing
* Random colors
* Overuse of glassmorphism
* Unnecessary dashboard charts
* Cluttered cards
* Template-like AI design

Use consistent:

* Typography
* Border radius
* Container widths
* Spacing
* Button variants
* Form controls
* Table styles
* Status colors
* Empty states
* Skeletons

---

# Required Completion Report Format

At the end of every part, respond using this structure:

## Part [number] Completion Report

### Completed

* List the completed features.

### Files Created

* List each created file.

### Files Modified

* List each modified file.

### Files Deleted

* List deleted files, or write `None`.

### Important Implementation Notes

* Explain important architectural decisions.
* Mention any assumption.
* Mention any backend dependency.

### Manual Testing Steps

1. Provide clear steps to test the feature.
2. Include expected successful behavior.
3. Include at least one validation or error test.
4. Include role-access testing when applicable.

### Validation Performed

* TypeScript check result
* Lint result
* Build result
* Relevant manual test result

Do not claim a command passed unless you actually ran it.

### Suggested Git Commit

```bash
git add .
git commit -m "your professional commit message"
```

Then end with:

**Part [number] completed. Please review, test, and commit the changes. Give me permission before I start Part [next number].**

---

# Initial Instruction

Start with **Part 1 only**.

First inspect the existing project thoroughly.

Do not implement Part 2 or any later part.

Do not rebuild the project from scratch.

Preserve all working authentication and proxy functionality.

Complete Part 1, provide the required report, suggest a Git commit message, and then stop.
