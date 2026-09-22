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
| `POST /api/auth/register/vendor` | Public | Creates Vendor + profile, sends email confirmation |
| `POST /api/auth/register/admin` | Admin only | Existing admin vouches for a new one |
| `POST /api/auth/login` | Public | Returns access token (15 min) + refresh token (7 days) |
| `POST /api/auth/refresh` | Public | Rotates refresh token; reuse of a revoked token revokes **all** sessions |
| `POST /api/auth/revoke` | Public | Logout — revokes a specific refresh token |
| `POST /api/auth/confirm-email` | Public | |
| `POST /api/auth/forgot-password` | Public | Always returns a generic response (no email enumeration) |
| `POST /api/auth/reset-password` | Public | Revokes all sessions on success |
| `POST /api/auth/change-password` | Authenticated | Revokes all sessions on success |
| `GET /api/auth/me` | Authenticated | Current user profile |

All `/api/auth/*` endpoints are rate-limited (10 requests/min/IP).

## Security notes

- Passwords hashed via ASP.NET Identity (PBKDF2), never stored in plaintext.
- Refresh tokens are 256-bit CSPRNG values; only their SHA-256 hash is persisted.
- Account lockout after 5 failed logins (15 min).
- Login/forgot-password responses are generic to prevent account enumeration.
- Email confirmation required before first login.
- In Development, the confirmation/reset token is written to the console log instead of a real
  email (`ConsoleEmailService`) — swap for Azure Communication Services or SendGrid before
  shipping.

## Azure deployment

- `Jwt:Secret`, `ConnectionStrings:DefaultConnection`, and `AdminBootstrap:*` must be set as
  App Service Configuration values or pulled from Azure Key Vault — never checked into
  `appsettings.json`.
- Set `Cors:AllowedOrigins` to the deployed admin web app / mobile app origins.
