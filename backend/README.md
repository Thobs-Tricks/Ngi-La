# Ngila API

ASP.NET Core Web API (.NET 8) backend for Ngila — community-powered street economy platform.
Serves three actors: **Admin** (web), **Vendor** (app), **Customer** (app).

## Stack

- ASP.NET Core 8 Web API + ASP.NET Core Identity
- SQL Server (Azure SQL in production, LocalDB for local dev)
- JWT access tokens + rotating refresh tokens (hashed at rest, reuse detection)
- FluentValidation, Swagger/OpenAPI
- Deploy target: Azure App Service + Azure SQL

## Project layout

```
src/Ngila.Api/
  Controllers/      API endpoints
  Services/          Business logic (AuthService, TokenService, EmailService)
  Data/              EF Core DbContext, migrations, seeding
  Models/Entities/   EF entities (ApplicationUser, RefreshToken, VendorProfile, CustomerProfile)
  DTOs/              Request/response contracts
  Validators/        FluentValidation rules
  Middleware/         Exception handling, security headers
  Configuration/      Strongly-typed settings (JwtSettings, AdminBootstrapSettings)
```

See [docs/DATABASE.md](docs/DATABASE.md) for the full schema reference (ER diagram, table/column
reference, indexes, and the reasoning behind the auth-related design decisions).

## Local setup

1. **Prerequisites**: .NET 8 SDK, SQL Server LocalDB (ships with Visual Studio) or any SQL Server instance.

2. **Configure secrets** (never commit these — they live outside the repo via `dotnet user-secrets`):

   ```bash
   cd src/Ngila.Api
   dotnet user-secrets init   # already done — UserSecretsId is in the .csproj
   dotnet user-secrets set "Jwt:Secret" "<a random 48+ byte base64 string>"
   dotnet user-secrets set "AdminBootstrap:Email" "you@example.com"
   dotnet user-secrets set "AdminBootstrap:Password" "SomeStrong!Passw0rd"
   dotnet user-secrets set "Cloudinary:CloudName" "..."   # optional - only needed to test media upload
   dotnet user-secrets set "Cloudinary:ApiKey" "..."
   dotnet user-secrets set "Cloudinary:ApiSecret" "..."
   ```

   Generate a secret: `openssl rand -base64 48`

   **Using the shared dev database instead of local SQL Server**: ask a teammate for the
   `sql-ngila` connection string (Azure Portal → SQL databases → `ngila-db` → Connection
   strings), then:

   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<the connection string they give you>"
   ```

   This points your local API at the **same live database the deployed API and everyone else's
   local run use** — convenient for a hackathon, but be aware your local testing reads/writes
   real data everyone else sees too. Never paste the real connection string into a file that gets
   committed (appsettings.*.json, this README, a commit message, etc.) — `dotnet user-secrets`
   keeps it outside the repo entirely. The SQL server firewall is currently open to all IPs
   (`AllowAllForHackathon`) so this works from anywhere; tighten that again once the DB holds
   anything worth protecting.

   `AdminBootstrap` creates the **first** Admin account automatically on startup (only if no
   Admin exists yet). Every subsequent Admin must be created by an existing Admin via
   `POST /api/auth/register` with `userType: "Admin"` while authenticated as one — see below.

3. **Apply migrations**:

   ```bash
   dotnet tool install --global dotnet-ef   # if not already installed
   dotnet ef database update
   ```

4. **Run**:

   ```bash
   dotnet run
   ```

   Swagger UI is available at `/swagger` in Development.

## Auth endpoints

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/auth/register` | Public\* | One endpoint for all three account types — see below |
| `POST /api/auth/login` | Public | Returns access token (15 min) + refresh token (7 days) |
| `POST /api/auth/refresh` | Public | Rotates refresh token; reuse of a revoked token revokes **all** sessions |
| `POST /api/auth/revoke` | Public | Logout — revokes a specific refresh token |
| `POST /api/auth/confirm-email` | Public | |
| `POST /api/auth/forgot-password` | Public | Always returns a generic response (no email enumeration) |
| `POST /api/auth/reset-password` | Public | Revokes all sessions on success |
| `POST /api/auth/change-password` | Authenticated | Revokes all sessions on success |
| `GET /api/auth/me` | Authenticated | Current user profile |

All `/api/auth/*` endpoints are rate-limited (10 requests/min/IP). Passwords are sent once —
there is no `confirmPassword`/`confirmNewPassword` field anywhere in the API; matching the two
password fields is a client-side concern only.

Enums (`userType`, `gender`, and any future ones) are sent/received as readable strings
(`"Vendor"`, not `1`) — set globally via `JsonStringEnumConverter` in `Program.cs`.

### `POST /api/auth/register`

One shape for all three account types:

```json
{
  "userType": "Customer" | "Vendor" | "Admin",
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "phoneNumber": "...",   // optional
  "password": "...",
  "gender": "Female" | "Male" | "Other"   // optional
}
```

\* The route itself is anonymous-reachable (Customer/Vendor must be publicly self-serve), but
`userType: "Admin"` is rejected with `403` unless the caller is already authenticated **as an
Admin** — checked inside the handler (`AuthService.RegisterAsync`), since the route can't declare
`[Authorize]` for only some request bodies. **Don't remove that check without replacing it** —
it's the only thing stopping anonymous self-service Admin creation now that Customer, Vendor and
Admin share one endpoint. There is only one Admin type — every admin account has identical
permissions, no sub-roles.

Side effects differ by type, same as before the endpoints were merged:
- **Customer** — creates a `CustomerProfile` row, sends confirmation email
- **Vendor** — no profile created (set up separately via `PUT /api/vendors/me`), sends confirmation email
- **Admin** — email pre-confirmed (trusted peer created it), no confirmation email sent

## Discovery & feed endpoints

Public, read-only, no auth required. Rate-limited more generously than auth (60 requests/min/IP).

| Endpoint | Notes |
|---|---|
| `GET /api/categories` | List of vendor categories |
| `GET /api/vendors` | Query params: `lat`, `lng`, `categoryId`, `search` (all optional). Sorted by distance from the given coordinates; defaults to Johannesburg CBD if omitted |
| `GET /api/vendors/{id}` | Vendor detail, including raw `latitude`/`longitude` (for building a maps deep link) |
| `GET /api/vendors/{id}/reviews` | Reviews for one vendor, newest first |
| `GET /api/feed` | Recent community feed posts. Optional `take` (default 20, max 50) |
| `GET /api/stats` | Platform-wide counts (vendors, reviews, areas) — backs the home screen's stat cards |

A vendor is discoverable if it isn't suspended, and either has no owner yet (community-added, see
below) or its owner has confirmed their email — an unconfirmed self-registration doesn't appear
as a public listing. `rating`/`reviewsCount` are system-set only, updated by `POST .../reviews`,
never accepted from a vendor's own registration/profile request.

## Vendor onboarding: two ways to end up with a shop profile

Registering a Vendor account (`POST /api/auth/register` with `userType: "Vendor"`) creates a bare
account with no shop profile yet — the vendor app's "MySpaza" screen is where that actually gets
set up: register → confirm email → log in → `PUT /api/vendors/me` whenever ready (see below).

Setting up or editing a shop is three independent calls, so the app can save one section without
resending the others:

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/vendors/me` | Vendor only | The calling vendor's own shop profile. `404` if not set up yet |
| `PUT /api/vendors/me` | Vendor only | Business details. Creates the profile the first time (`201`), updates it thereafter (`200`) — full replace every field, not a diff. `{ businessName, description?, categoryIds[], locationDescription, latitude?, longitude?, contactPhone?, imageUrl? }` |
| `PUT /api/vendors/me/trading-hours` | Vendor only | Full replace of the weekly schedule. Requires the profile from `PUT /me` to already exist (`404` otherwise). `{ tradingHours: [{ day, isOpen, openTime?, closeTime? }] }` |
| `PUT /api/vendors/me/photos` | Vendor only | Full replace of the gallery, capped at 5. Requires the profile from `PUT /me` to already exist (`404` otherwise). `{ photoUrls: string[] }` |

`categoryIds` is plural and can hold more than one — a spaza selling both kota and airtime picks
both. `tradingHours` is a list of up to 7 entries, one per day: `{ day: "Monday".."Sunday",
isOpen, openTime?: "HH:mm", closeTime?: "HH:mm" }` (`openTime`/`closeTime` required when
`isOpen` is true). `photoUrls` is the gallery (see Media below), separate from the single
`imageUrl` main listing photo set via `PUT /me`. `contactPhone` is the business's own number shown
to customers — takes priority over the vendor's personal account phone if both are set.

## Reviews & notifications

These back the customer app's "Rate Vendor" and notification-bell actions.

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/vendors/{id}/reviews` | Authenticated | `{ rating: 1-5, comment? }`. Resubmitting updates your existing review (one per user per vendor) rather than creating a duplicate; `rating`/`reviewsCount` on the vendor update via a running weighted average, not a full table scan |
| `GET /api/notifications` | Authenticated | Current user's notifications, newest first |
| `POST /api/notifications/{id}/read` | Authenticated | Mark one as read |
| `POST /api/notifications/read-all` | Authenticated | Mark all as read |

A vendor's `phone` in discovery responses is its owner's `PhoneNumber`, falling back to the
`contactPhone` set on their profile.

## Media (photos)

Images only, no video. Backed by Cloudinary, not Azure Blob Storage — this subscription's Azure
policy disallows the `Microsoft.Storage` provider, and the SQL free tier (32MB) can't hold real
files.

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/media/upload` | Authenticated | `multipart/form-data`, field name `file`. jpg/jpeg/png/webp/gif, ≤10MB. Returns `{ url, resourceType }`. Call once per photo, then pass the returned URLs to the endpoints below |

Configure `Cloudinary:CloudName`/`ApiKey`/`ApiSecret` (user-secrets locally, App Settings in
Azure) — the *Cloud name*, not the key's label (Cloudinary's dashboard confusingly shows both).
Until configured, uploads return `503` rather than failing the whole request.

### Feed: posts, likes, comments

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/feed` | Authenticated | `{ content, vendorId?, photoUrls? }` — up to 5 `photoUrls`. `vendorId` tags a vendor stall on the post. `authorDisplayRole` is set server-side from the caller's actual role, not client-supplied |
| `POST /api/feed/{id}/like` | Authenticated | Toggles - liking an already-liked post unlikes it. Returns `{ liked, likesCount }` |
| `GET /api/feed/{id}/comments` | Public | Oldest first |
| `POST /api/feed/{id}/comments` | Authenticated | `{ content }` |

`GET /api/feed` includes `likedByMe` per post — `false` for anonymous callers, otherwise whether
the caller has liked it.

### Vendor profile photos

`PUT /api/vendors/me` (`UpsertVendorProfileRequest`) gained `photoUrls` (up to 5) alongside the
existing single `imageUrl` (the main listing photo). Full replace each call, same as every other
field on this endpoint — resend the whole gallery, not a diff. Category selection and profile
editing were already supported by this same endpoint (`categoryId` from `GET /api/categories`,
re-`PUT` to edit).

## Admin console

Built directly against `Admin/` (the TanStack Start admin web app in this repo) — every
interactive element there (verification decisions, category creation, report resolution) is
backed by a real endpoint, not just the read-only views.

There is only one Admin type — every admin account can perform every admin action
(`[Authorize(Roles = Roles.Admin)]` is the only gate; no sub-roles or permission tiers).

### Vendor verification queue

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/vendors/verification-queue` | Admin | Freshly self-registered vendors with `Status = PendingVerification` |
| `POST /api/vendors/{id}/verify` | Admin | Sets `Status = Verified`, notifies the owner |
| `POST /api/vendors/{id}/reject-claim` | Admin | Reverts the listing to **unclaimed** (`UserId = null`) rather than suspending it. Legacy moderation action, kept for existing/unusual cases; there's no self-serve way to re-claim an unclaimed listing anymore. Notifies the (former) owner |
| `POST /api/vendors/{id}/request-info` | Admin | `{ message }` — sends the owner a notification with no status change |
| `GET /api/vendors/admin-list` | Admin | Full vendor list for the "Claims & Vendors" admin table — includes suspended/unclaimed listings the public `GET /api/vendors` hides |
| `POST /api/vendors/{id}/suspend` | Admin | Only valid from `Verified` — sets `Status = Suspended`, notifies the owner |
| `POST /api/vendors/{id}/unsuspend` | Admin | Only valid from `Suspended` — reverts to `Verified` |

### Categories, reports, dashboard

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/categories` | Admin | `{ name }`. `409` on a duplicate name |
| `POST /api/reports` | Authenticated (any role) | File a report: `{ kind: "Flag" \| "ReviewDispute", title, detail, targetVendorId? or targetReviewId? }` — matches the doc's community-moderation flow |
| `GET /api/admin/reports` | Admin | All reports, open first, then by priority/recency |
| `POST /api/admin/reports/{id}/resolve` | Admin | Idempotent — resolving twice is a no-op |
| `GET /api/admin/stats` | Admin | `{ totalVendors, communityAdded, pendingVerification, activeUsers, reportsOpen }` |
| `GET /api/admin/activity` | Admin | Recent activity feed. Optional `take` (default 20, max 100). Written by a small set of trigger points (vendor added/claimed/verified, claim rejected, report resolved) — not a full audit log of every write |
| `GET /api/admin/users` | Admin | Every user with role, active status, join date, vendors added, reviews written. No gamification (points/levels/"Inspector" role) — deliberately deferred, matches the product doc's own MVP scoping |

## Security notes

- Passwords hashed via ASP.NET Identity (PBKDF2), never stored in plaintext.
- Refresh tokens are 256-bit CSPRNG values; only their SHA-256 hash is persisted.
- Account lockout after 5 failed logins (15 min).
- Login/forgot-password responses are generic to prevent account enumeration.
- Email confirmation required before first login.
- In Development, the confirmation/reset token is written to the console log instead of a real
  email (`ConsoleEmailService`) — swap for Azure Communication Services or SendGrid before
  shipping.

## Seed data

`Data/DbSeeder.cs` runs automatically on every startup (local and Azure) and is idempotent —
safe to redeploy repeatedly, it only creates what's missing. It seeds:

- The 3 roles (Admin/Vendor/Customer) and the bootstrap Admin (from `AdminBootstrap:*` config)
- 7 categories matching the frontend's filter list
- 7 demo vendors and 4 demo customers (password for all: `Demo@Pass2026`), matching the names/
  businesses used in the customer app's UI mocks (`frontend/mobile/customer/constants/vendor.ts`
  and `feed.ts`) so real API data lines up with what the screens were designed around
- 3 demo feed posts referencing those seeded vendors
- 2 demo notifications for one of the seeded customers

All seeded accounts are pre-confirmed (`EmailConfirmed = true`) and skip the email-confirmation
step, since they're created directly rather than through `/api/auth/register`.

## Azure deployment

- `Jwt:Secret`, `ConnectionStrings:DefaultConnection`, and `AdminBootstrap:*` must be set as
  App Service Configuration values or pulled from Azure Key Vault — never checked into
  `appsettings.json`.
- Set `Cors:AllowedOrigins` to the deployed admin web app / mobile app origins.
