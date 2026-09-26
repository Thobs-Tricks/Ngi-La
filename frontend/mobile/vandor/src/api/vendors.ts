// Real calls against /vendors/me — a vendor's own spaza profile.
//
// The PUT request shapes below are confirmed from Swagger UI screenshots
// (2026-09):
//
// PUT /vendors/me — upsert (creates the profile if none exists, updates it
// otherwise): { businessName, description, categoryIds: string[],
// locationDescription, latitude, longitude, contactPhone, imageUrl }
//
// PUT /vendors/me/trading-hours: { tradingHours: [{ day, isOpen, openTime,
// closeTime }] }. Confirmed live 2026-09: openTime/closeTime are plain
// "HH:mm" strings (no seconds), null for a closed day.
//
// PUT /vendors/me/photos: { photoUrls: string[] } — plain hosted URLs. There
// is still no upload endpoint anywhere in the API, so this only makes sense
// once photos are hosted somewhere; see the Promo section's caller for how
// local picks are handled in the meantime.
//
// The GET /vendors/me response shape was confirmed directly from a live
// response (2026-09), and it does NOT mirror the PUT input field names —
// it's the same enriched shape used for public vendor listings/detail
// (it even carries "distance" and "rating"):
//   { id, name, categories: string[] (display NAMES, not ids), description,
//     location, distance, latitude, longitude, rating, reviewsCount, isOpen,
//     isVerified, claimed, image, photos: string[], phone,
//     tradingHours: [{ day, isOpen, openTime: string|null, closeTime: string|null }] }
// A closed day comes back with openTime/closeTime as null rather than a
// placeholder time. Since the response gives category NAMES and PUT expects
// category IDS, the screen resolves names back to ids against the loaded
// /categories list (see MySpazaScreen) — parseVendor just passes the names
// through as categoryNames.
import { apiClient, ApiError } from './client';

export interface TradingHourEntry {
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface VendorProfile {
  id?: string;
  businessName: string;
  description: string;
  categoryIds: string[];
  categoryNames: string[];
  locationDescription: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  imageUrl: string;
  tradingHours: TradingHourEntry[];
  photoUrls: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  claimed: boolean;
}

export interface VendorProfileInput {
  businessName: string;
  description: string;
  categoryIds: string[];
  locationDescription: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  imageUrl: string;
}

type RawVendor = Record<string, any>;

function parseVendor(data: RawVendor): VendorProfile {
  return {
    id: data.id ?? data.vendorId ?? undefined,
    businessName: data.name ?? data.businessName ?? '',
    description: data.description ?? '',
    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
    categoryNames: Array.isArray(data.categories) ? data.categories : [],
    locationDescription: data.location ?? data.locationDescription ?? '',
    latitude: typeof data.latitude === 'number' ? data.latitude : null,
    longitude: typeof data.longitude === 'number' ? data.longitude : null,
    contactPhone: data.phone ?? data.contactPhone ?? '',
    imageUrl: data.image ?? data.imageUrl ?? '',
    tradingHours: Array.isArray(data.tradingHours)
      ? data.tradingHours.map((h: RawVendor) => ({
          day: h.day ?? '',
          isOpen: !!h.isOpen,
          openTime: h.openTime ?? null,
          closeTime: h.closeTime ?? null,
        }))
      : [],
    photoUrls: Array.isArray(data.photos) ? data.photos : Array.isArray(data.photoUrls) ? data.photoUrls : [],
    rating: typeof data.rating === 'number' ? data.rating : 0,
    reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 0,
    isVerified: !!data.isVerified,
    claimed: !!data.claimed,
  };
}

/** GET /vendors/me — returns null for a vendor with no spaza yet (404), so
 * the screen can show the create form instead of treating it as an error. */
export async function getMyVendor(accessToken: string): Promise<VendorProfile | null> {
  try {
    const data = await apiClient.get<RawVendor>('/vendors/me', accessToken);
    return data ? parseVendor(data) : null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** PUT /vendors/me — upsert: creates the profile the first time, updates it
 * after that. */
export async function upsertMyVendor(accessToken: string, input: VendorProfileInput): Promise<VendorProfile | null> {
  const data = await apiClient.put<RawVendor>('/vendors/me', input, accessToken);
  return data ? parseVendor(data) : null;
}

/** PUT /vendors/me/trading-hours */
export async function updateTradingHours(accessToken: string, tradingHours: TradingHourEntry[]): Promise<void> {
  await apiClient.put<unknown>('/vendors/me/trading-hours', { tradingHours }, accessToken);
}

export interface VendorReviewRaw {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  time: string; // pre-formatted relative string from the server, e.g. "28m ago"
}

/** GET /vendors/{vendorId}/reviews — confirmed live 2026-09. Public-looking
 * (no auth issues seen), scoped to a specific vendor id rather than "me", so
 * callers need the vendor's own id from getMyVendor() first. */
export async function getVendorReviews(vendorId: string, accessToken?: string): Promise<VendorReviewRaw[]> {
  const data = await apiClient.get<VendorReviewRaw[]>(`/vendors/${vendorId}/reviews`, accessToken);
  return Array.isArray(data) ? data : [];
}

/** PUT /vendors/me/photos */
export async function updatePhotos(accessToken: string, photoUrls: string[]): Promise<void> {
  await apiClient.put<unknown>('/vendors/me/photos', { photoUrls }, accessToken);
}
