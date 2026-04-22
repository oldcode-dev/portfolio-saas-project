# Digital Service Bay — Detailed Directory Tree with Annotations

```
dsb-nextjs/
│
├─ CONFIG & SETUP FILES
│  ├─ .env.example                  [~1.3 KB] ── Environment variables template
│  │                                           ── NEXT_PUBLIC_* = browser-safe
│  │                                           ── Others = server-only
│  ├─ .gitignore                    [~200 B]  ── Git ignore (node_modules, .env.local, etc.)
│  ├─ package.json                  [~1.2 KB] ── Dependencies: next, react, @supabase/supabase-js, twilio
│  ├─ package-lock.json             [varies]  ── Locked versions (generated)
│  ├─ next.config.js                [~600 B]  ── Image domains, redirect rules
│  ├─ tailwind.config.js            [~600 B]  ── Dark mode, color palette, typography
│  ├─ postcss.config.js             [~200 B]  ── Tailwind + Autoprefixer pipeline
│  └─ tsconfig.json (optional)      [~500 B]  ── TypeScript config (if converting to TS)
│
├─ app/                             [APP ROUTER — Next.js 14]
│  │                                           ── All routing via filesystem
│  │                                           ── Metadata, layouts inherited from parent
│  │
│  ├─ layout.jsx                    [~2.5 KB] ── Root layout
│  │                                           ┌─ Imports: Syne + JetBrains Mono fonts
│  │                                           ├─ Sets metadata (title, og:image, etc.)
│  │                                           ├─ Renders: <html>, <head>, <body>
│  │                                           ├─ Includes: Paystack SDK <script> tag
│  │                                           ├─ Wraps: <NavBar /> + {children}
│  │                                           └─ Exports: RootLayout
│  │
│  ├─ globals.css                   [~2 KB]   ── Global Tailwind setup
│  │                                           ┌─ @tailwind base/components/utilities
│  │                                           ├─ CSS custom properties (--bg, --accent, etc.)
│  │                                           ├─ @keyframes for animations (fadeUp, slideIn, pulse, spin)
│  │                                           ├─ Animation utility classes (.animate-fadeUp, .delay-1, etc.)
│  │                                           └─ Typography, scrollbar styling
│  │
│  ├─ page.jsx                      [~2.2 KB] ── Home page (async Server Component)
│  │                                           ┌─ Async: fetches GitHub repos server-side (ISR)
│  │                                           ├─ Renders: <HeroSection /> + <ServiceGrid /> + <GitHubStatus />
│  │                                           ├─ Passes: repos & profile as props to GitHubStatus
│  │                                           ├─ No client state needed
│  │                                           └─ Exports: HomePage, metadata
│  │
│  ├─ triage/
│  │  └─ page.jsx                   [~800 B]  ── Triage bot page (Server Component wrapper)
│  │                                           ┌─ Metadata: "Diagnose Your Issue"
│  │                                           ├─ Renders: <TriageBot /> (Client Component)
│  │                                           └─ Exports: metadata
│  │
│  ├─ book/
│  │  └─ page.jsx                   [~1.5 KB] ── Booking page (Server Component wrapper)
│  │                                           ┌─ Reads: searchParams (URL query string)
│  │                                           ├─ Parses: ?service=..., ?deposit=..., ?diagnosticPath=JSON
│  │                                           ├─ Renders: <BookingFlow preselect={...} />
│  │                                           └─ Exports: metadata
│  │
│  ├─ dashboard/
│  │  └─ page.jsx                   [~800 B]  ── Admin dashboard page (Server Component wrapper)
│  │                                           ┌─ Metadata: robots { index: false } (protect from search)
│  │                                           ├─ Renders: <DashboardClient /> (handles auth, real-time)
│  │                                           └─ Exports: metadata
│  │
│  └─ api/                          [API ROUTES — Edge Functions]
│     │                                        ── Each route.js is a handler
│     │                                        ── Exports: async GET(), POST(), etc.
│     │                                        ── Uses: Supabase service role (server-only)
│     │
│     ├─ webhooks/paystack/
│     │  └─ route.js                [~4 KB]   ── POST /api/webhooks/paystack
│     │                                           Paystack webhook handler (charge.success event)
│     │                                           ┌─ Verifies HMAC-SHA512 signature (security)
│     │                                           ├─ Fetches booking by payment_ref
│     │                                           ├─ Updates status → CONFIRMED
│     │                                           ├─ Sends WhatsApp to admin (Twilio)
│     │                                           ├─ Sends SMS to client (Twilio)
│     │                                           ├─ Returns 200 always (prevents retry loops)
│     │                                           └─ Exports: POST handler
│     │
│     ├─ bookings/
│     │  └─ route.js                [~2.5 KB] ── GET/POST /api/bookings
│     │                                           GET: List bookings (admin, optional filters)
│     │                                           ├─ Query params: ?status=CONFIRMED, ?date=YYYY-MM-DD
│     │                                           └─ Returns: { bookings: [...] }
│     │
│     │                                           POST: Create booking (after successful payment)
│     │                                           ├─ Body: clientName, clientPhone, serviceName, etc.
│     │                                           ├─ Idempotency: returns existing if payment_ref exists
│     │                                           ├─ Inserts: new booking with status=CONFIRMED
│     │                                           └─ Returns: { bookingId, status }
│     │
│     └─ availability/
│        └─ route.js                [~1.5 KB] ── GET /api/availability?date=YYYY-MM-DD
│                                                   Returns booked time slots for a date
│                                                   ┌─ Query param: ?date=2025-01-22 (required)
│                                                   ├─ Fetches: bookings for that date (not CANCELLED)
│                                                   ├─ Extracts: HH:MM from slot_datetime
│                                                   ├─ Cache-Control: s-maxage=60 (1 min server cache)
│                                                   └─ Returns: { date, bookedTimes: ["09:00","11:00",...] }
│
├─ lib/                            [SHARED SERVER/CLIENT UTILITIES]
│  │
│  ├─ supabase.js                  [~1.2 KB] ── Supabase client factory
│  │                                           ┌─ getBrowserClient() — singleton, anon key (client components)
│  │                                           ├─ Exports: supabase object (auth, from, channel, etc.)
│  │                                           ├─ Auth helpers: signInAdmin(email, password), signOut()
│  │                                           └─ Used by: DashboardClient, hooks, all Client Components
│  │
│  └─ github.js                    [~2 KB]   ── GitHub API client (Server Components)
│                                               Fetch repos & profile with ISR caching
│                                               ┌─ fetchRepos(limit) — sort by pushed, return 6 repos
│                                               │  ├─ With token: 5000 req/hr
│                                               │  ├─ Without token: 60 req/hr
│                                               │  └─ Returns: [{ id, name, description, url, language, stars, forks, updatedAt, topics }]
│                                               ├─ fetchProfile() — returns GitHub user data
│                                               ├─ Uses: next: { revalidate: 300 } (5-min ISR)
│                                               ├─ Fallback: MOCK_REPOS if API fails
│                                               └─ Used by: app/page.jsx (Server Component)
│
├─ components/                     [REACT COMPONENTS]
│  │
│  ├─ ui/                          [SHARED UI PRIMITIVES]
│  │  │                             ┌─ All marked with "use client" at top
│  │  │                             └─ No business logic, pure presentation
│  │  │
│  │  ├─ primitives.jsx            [~3 KB]   ── Base components (reused everywhere)
│  │  │                                       ┌─ Button(variant, size, disabled, fullWidth)
│  │  │                                       │  └─ Variants: primary, secondary, ghost, danger, green
│  │  │                                       ├─ Badge(color, bg) — inline badge
│  │  │                                       ├─ Spinner(size, color) — loading indicator
│  │  │                                       ├─ StatusDot(status) — online/busy/offline dot
│  │  │                                       └─ Modal(isOpen, onClose, title, children)
│  │  │
│  │  ├─ NavBar.jsx                [~2 KB]   ── Sticky header navigation
│  │  │                                       ┌─ Uses: usePathname(), useRouter() from next/navigation
│  │  │                                       ├─ Logo links to "/" (Link component)
│  │  │                                       ├─ Nav links highlight active page
│  │  │                                       ├─ CTA button: "Start Triage →"
│  │  │                                       └─ Position: fixed, z-index: 500
│  │  │
│  │  └─ SiteFooter.jsx            [~800 B]  ── Footer with links & copyright
│  │                                           ┌─ Links: WhatsApp, email
│  │                                           ├─ Year auto-updated
│  │                                           └─ Stack: Next.js + Supabase
│  │
│  ├─ portfolio/                   [HOME PAGE SECTIONS]
│  │  │
│  │  ├─ HeroSection.jsx           [~2.5 KB] ── Hero banner with CTA buttons
│  │  │                                       ┌─ Uses: useRouter() to navigate on click
│  │  │                                       ├─ Status badge: "Available for new bookings"
│  │  │                                       ├─ Headline: "Your Systems, Running Clean"
│  │  │                                       ├─ Gradient text
│  │  │                                       ├─ Trust signals: "100+ Jobs Done", "MoMo Payments", etc.
│  │  │                                       ├─ Background: animated grid + glow orbs
│  │  │                                       └─ CTAs: "Run Diagnostic" + "Book a Slot"
│  │  │
│  │  ├─ ServiceGrid.jsx           [~4 KB]   ── Filterable 9 service cards
│  │  │                                       ┌─ Category filter: All, Hardware, Software, Network, etc.
│  │  │                                       ├─ Per card: icon, category badge, price, duration, deposit
│  │  │                                       ├─ "Popular" star badge on 3 services
│  │  │                                       ├─ Hover effects: translate up, glow
│  │  │                                       ├─ Book Now redirects to /book?service=...&deposit=...
│  │  │                                       └─ Uses: useRouter() for navigation
│  │  │
│  │  └─ GitHubStatus.jsx          [~3 KB]   ── Live GitHub repos grid
│  │                                           ┌─ Receives: repos & profile as props (from server)
│  │                                           ├─ Shows: 6 repos with language dots, stars, forks
│  │                                           ├─ Topics: tags for each repo
│  │                                           ├─ Link: opens to GitHub (target="_blank")
│  │                                           ├─ TimeAgo: "2 days ago", "1 week ago"
│  │                                           └─ No client fetch (data comes from server-side ISR)
│  │
│  ├─ triage/                      [DIAGNOSTIC BOT]
│  │  │
│  │  └─ TriageBot.jsx             [~7 KB]   ── Full state machine FSM component
│  │                                           ┌─ Data: TRIAGE_TREE with 24 nodes (1 START + 4 Q1s + 19 terminals)
│  │                                           ├─ State: currentNodeId, path, phase (question|result)
│  │                                           ├─ Navigation: useRouter() to /book with results
│  │                                           ├─ Subcomponents:
│  │                                           │  ├─ StepIndicator — shows progress (Identify → Diagnose → Confirm → Book)
│  │                                           │  ├─ QuestionCard — displays question + options with selection UI
│  │                                           │  └─ DiagnosisCard — shows results with urgency badge, pricing
│  │                                           ├─ Features: back button, restart, smooth scrolling
│  │                                           └─ Exports: TriageBot as default
│  │
│  ├─ booking/                     [BOOKING FLOW]
│  │  │                             ┌─ Multi-step: Calendar → Form → Payment → Confirmation
│  │  │                             └─ All Client Components
│  │  │
│  │  ├─ BookingFlow.jsx           [~4 KB]   ── Main orchestrator
│  │  │                                       ┌─ Props: preselect (from server props) or URL searchParams
│  │  │                                       ├─ Step state: 0=calendar, 1=form, 2=payment, 3=confirmation
│  │  │                                       ├─ Reads: useSearchParams() for ?service=..., ?diagnosticPath=...
│  │  │                                       ├─ Parses: URL params and query strings
│  │  │                                       ├─ Renders: different component per step
│  │  │                                       ├─ On payment success: POST /api/bookings with full booking data
│  │  │                                       └─ Exports: BookingFlow as default
│  │  │
│  │  ├─ BookingCalendar.jsx       [~3.5 KB] ── Calendar + time slot picker
│  │  │                                       ┌─ Calendar navigation: month/year arrows
│  │  │                                       ├─ Day picker: prevents past dates, marks fully booked
│  │  │                                       ├─ Time slots: 8 slots per day (09:00–17:00)
│  │  │                                       ├─ Real availability: fetches /api/availability?date=YYYY-MM-DD
│  │  │                                       ├─ Shows booked slots as strikethrough (disabled)
│  │  │                                       ├─ Returns: { date, time, display }
│  │  │                                       └─ Used by: BookingFlow (step 0)
│  │  │
│  │  └─ BookingForm.jsx           [~2.5 KB] ── Client details form
│  │                                           ┌─ Fields: name, phone, email, location, notes
│  │                                           ├─ Validation: real-time on blur, required indicators
│  │                                           ├─ Error messages below each field
│  │                                           └─ Used by: BookingFlow (step 1)
│  │
│  ├─ payment/                     [PAYMENT PROCESSING]
│  │  │
│  │  └─ PaymentGateway.jsx        [~2.5 KB] ── Paystack inline popup
│  │                                           ┌─ Displays: booking summary, deposit amount, payment methods
│  │                                           ├─ SDK: uses window.PaystackPop.setup()
│  │                                           ├─ Reference generation: DSB-{timestamp}-{random}
│  │                                           ├─ Metadata: client name, phone attached to transaction
│  │                                           ├─ Success callback: calls onSuccess() with reference
│  │                                           ├─ Error: popup close, network error handling
│  │                                           └─ Used by: BookingFlow (step 2)
│  │
│  └─ dashboard/                   [ADMIN OPS HUB]
│     │                             ┌─ Real-time Supabase subscriptions
│     │                             └─ Role-based access control
│     │
│     ├─ DashboardClient.jsx       [~3 KB]   ── Auth gate + session management
│     │                                       ┌─ Checks: supabase.auth.getSession() on mount
│     │                                       ├─ If not authed: shows LoginScreen
│     │                                       ├─ Login: email/password via signInAdmin()
│     │                                       ├─ Demo mode: "Preview Dashboard" button (auto-auth)
│     │                                       ├─ Renders: admin top bar + <OpsHub /> if authed
│     │                                       ├─ Sign out: calls signOut(), sets authed=false
│     │                                       └─ Exports: DashboardClient as default
│     │
│     └─ OpsHub.jsx                [~5 KB]   ── Main dashboard
│                                               ┌─ Stats cards: total deposits, confirmed, pending, today's jobs
│                                               ├─ Availability toggle: online/busy (persisted to settings table)
│                                               ├─ Real-time subscription: Supabase postgres_changes
│                                               ├─ Filter tabs: ALL, CONFIRMED, PENDING, CANCELLED
│                                               ├─ Bookings table: client, service, slot, deposit, urgency, status
│                                               ├─ Action buttons: View, Cancel (placeholder)
│                                               └─ Exports: OpsHub as default
│
├─ hooks/                          [CUSTOM REACT HOOKS]
│  │
│  └─ index.js                     [~2 KB]   ── Shared hooks
│                                               ┌─ useBookings({ status?, date? })
│                                               │  └─ Real-time Supabase subscription + filter
│                                               │     Returns: { bookings, loading, error, totalRevenue }
│                                               │
│                                               ├─ useAvailability(date)
│                                               │  └─ Fetches /api/availability on date change
│                                               │     Returns: { bookedSlots, isSlotAvailable(time), loading }
│                                               │
│                                               └─ useAdminStatus()
│                                                  └─ Toggle + persist to settings table
│                                                     Returns: { isAvailable, toggle() }
│
├─ utils/                          [PURE UTILITIES — NO REACT]
│  │
│  ├─ stateMachine.js              [~8 KB]   ── Triage FSM data (pure object)
│  │                                           ┌─ TRIAGE_TREE:
│  │                                           │  ├─ START node (branching entry)
│  │                                           │  ├─ 4 question branches (HARDWARE_Q1, NETWORK_Q1, SECURITY_Q1, SOFTWARE_Q1)
│  │                                           │  ├─ Sub-branches: HARDWARE_POWER, NETWORK_Q2, etc.
│  │                                           │  └─ 19 terminal nodes (END_*) with service details
│  │                                           │
│  │                                           └─ URGENCY_CONFIG:
│  │                                              ├─ CRITICAL, HIGH, MEDIUM, LOW
│  │                                              └─ Color, label, background per level
│  │
│  └─ formatters.js                [~2 KB]   ── String/data utilities
│                                               ┌─ formatCurrency(kobo) → "₦3,000"
│                                               ├─ formatDateTime(iso) → locale string
│                                               ├─ timeAgo(date) → "2 hours ago"
│                                               ├─ normalizePhone(raw) → "+233XXXXXXXXXX"
│                                               ├─ generateRef() → "DSB-{ts}-{rand}"
│                                               ├─ nairaToKobo(str) → integer
│                                               └─ truncate(str, max) → with ellipsis
│
├─ public/                         [STATIC ASSETS]
│  └─ (empty or favicon.svg, logo.png, etc.)
│
├─ supabase/                       [DATABASE & MIGRATIONS]
│  │
│  └─ migrations/
│     └─ 001_schema.sql            [~4 KB]   ── Complete Supabase schema
│                                               ┌─ Tables:
│                                               │  ├─ bookings (main table)
│                                               │  │  ├─ Columns: id, client_*, service_*, slot_*, payment_*, status, created_at, updated_at
│                                               │  │  ├─ Indexes: on status, slot_datetime, payment_ref, created_at
│                                               │  │  ├─ Trigger: auto-update updated_at on any change
│                                               │  │  └─ RLS policies: public insert, admin read/write
│                                               │  │
│                                               │  ├─ services (seed data for 9 services)
│                                               │  │  └─ Seeded with all service details
│                                               │  │
│                                               │  └─ settings (key-value for admin prefs)
│                                               │
│                                               └─ RLS Policies:
│                                                  ├─ Clients can insert bookings (anon)
│                                                  ├─ Admin has full access (service_role)
│                                                  └─ Authenticated users can read
│
└─ README.md                       [~3 KB]   ── Project documentation
                                               ┌─ Getting started
                                               ├─ Setup (env vars, Supabase, Paystack, Twilio)
                                               ├─ File structure overview
                                               ├─ Key architecture decisions
                                               ├─ Deployment checklist
                                               └─ Contributing guidelines

```

---

## Summary Statistics

| Category | Count | Total Size (est.) |
|----------|-------|-------------------|
| Config files | 8 | ~4.5 KB |
| App pages (Server Components) | 5 | ~7 KB |
| API routes | 3 | ~7.5 KB |
| UI primitives & layout | 3 | ~6 KB |
| Portfolio sections | 3 | ~9.5 KB |
| Triage components | 1 | ~7 KB |
| Booking components | 3 | ~10 KB |
| Payment components | 1 | ~2.5 KB |
| Dashboard components | 2 | ~8 KB |
| Lib utilities | 2 | ~3.2 KB |
| Hooks | 1 | ~2 KB |
| Utility functions | 2 | ~10 KB |
| SQL migrations | 1 | ~4 KB |
| Documentation | 1 | ~3 KB |
| **TOTAL** | **40** | **~93 KB** |

---

## Key Architectural Patterns

### 1. Server Components (Async) — Ownership: Data Fetching
- `app/page.jsx` — fetches GitHub repos with ISR caching
- `app/*/page.jsx` — metadata, route structure
- `lib/github.js` — server-side GitHub API client

### 2. Client Components (with "use client") — Ownership: Interactivity
- All components in `/components/` — UI, state, event handlers
- `hooks/` — client-side state subscriptions (Supabase real-time)
- `lib/supabase.js` — browser client factory

### 3. API Routes — Ownership: Backend Logic
- `/api/webhooks/paystack/` — payment confirmation + Twilio notifications
- `/api/bookings/` — booking CRUD
- `/api/availability/` — real-time slot availability

### 4. Data Flow
```
User → UI (Client Comp) 
  ↓
useRouter() / fetch() / Supabase real-time
  ↓
API Route / Supabase
  ↓
Database
  ↓
(async event) Paystack Webhook → API Route → Twilio SMS/WhatsApp
```

---

## Critical Dependencies

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS variables
- **DB**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth
- **Payment**: Paystack (client SDK + webhook)
- **Notifications**: Twilio (WhatsApp + SMS)
- **External API**: GitHub REST API
