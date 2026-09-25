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
   ```

   Generate a secret: `openssl rand -base64 48`

   `AdminBootstrap` creates the **first** Admin account automatically on startup (only if no
   Admin exists yet). Every subsequent Admin must be created by an existing Admin via
   `POST /api/auth/register/admin` — there's no public admin self-registration route.

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
| `POST /api/auth/register/customer` | Public | Creates Customer + profile, sends email confirmation |
| `POST /api/auth/register/vendor` | Public | Personal details only (name, phone, email, password, optional `gender`) — no shop info. Sends email confirmation |
| `POST /api/auth/register/admin` | Admin only | Existing admin vouches for a new one |
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

Enums (`gender`, and any future ones) are sent/received as readable strings (`"Male"`, not `1`) —
every registration DTO accepts an optional `gender: "Female" | "Male" | "Other"`.

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

Registering a Vendor account (`POST /api/auth/register/vendor`) creates a bare account with no
shop profile yet — the vendor app's "MySpaza" screen is where that actually gets set up. There
are two independent paths to owning a `VendorProfile`:

1. **Self-registration → set up shop later**: register → confirm email → log in → `PUT /api/vendors/me`
   whenever ready (see below).
2. **Claim an existing community-added listing**: someone already added this business via
   `POST /api/vendors` before its real owner ever signed up (see next section) — the owner finds
   it and calls `POST /api/vendors/{id}/claim`, which creates their account and attaches the
   existing listing in one step, skipping step 1 entirely.

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/vendors/me` | Vendor only | The calling vendor's own shop profile. `404` if not set up yet |
| `PUT /api/vendors/me` | Vendor only | Creates the profile the first time (`201`), updates it thereafter (`200`) — same endpoint for both, `{ businessName, description?, categoryId, locationDescription, latitude?, longitude?, openingTime?, closingTime?, imageUrl? }` |

## Community vendors, reviews & notifications

These back the customer app's "+ Add Vendor", "Rate Vendor" and notification-bell actions.

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/vendors` | Authenticated | Community-add a vendor Ngila doesn't know about yet. Starts **unclaimed** (`claimed: false`, no owning account) |
| `POST /api/vendors/{id}/claim` | Public | The real business claims an unclaimed listing — creates their account and attaches it in one step. `409` if already claimed. Notifies whoever added it |
| `POST /api/vendors/{id}/reviews` | Authenticated | `{ rating: 1-5, comment? }`. Resubmitting updates your existing review (one per user per vendor) rather than creating a duplicate; `rating`/`reviewsCount` on the vendor update via a running weighted average, not a full table scan |
| `GET /api/notifications` | Authenticated | Current user's notifications, newest first |
| `POST /api/notifications/{id}/read` | Authenticated | Mark one as read |
| `POST /api/notifications/read-all` | Authenticated | Mark all as read |

A vendor's `phone` in discovery responses is its owner's `PhoneNumber` once claimed, falling back
to the `contactPhone` supplied when it was community-added.

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
- 1 unclaimed community-added vendor ("Ntombi's Braai Stand") demonstrating the add/claim flow
- 2 demo notifications for one of the seeded customers

All seeded accounts are pre-confirmed (`EmailConfirmed = true`) and skip the email-confirmation
step, since they're created directly rather than through `/api/auth/register/*`.

## Azure deployment

- `Jwt:Secret`, `ConnectionStrings:DefaultConnection`, and `AdminBootstrap:*` must be set as
  App Service Configuration values or pulled from Azure Key Vault — never checked into
  `appsettings.json`.
- Set `Cors:AllowedOrigins` to the deployed admin web app / mobile app origins.
