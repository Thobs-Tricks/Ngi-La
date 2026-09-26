// GET/PUT /vendors/me — the calling vendor's own shop profile ("MySpaza"). Confirmed shapes
// from the live API.
import { apiClient, ApiError } from './client';

export interface TradingHourPayload {
  day: string; // "Monday".."Sunday"
  isOpen: boolean;
  openTime: string | null; // "HH:mm", required when isOpen
  closeTime: string | null;
}

export interface VendorProfileResponse {
  id: string;
  name: string;
  categories: string[];
  description: string | null;
  locationDescription: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  isVerified: boolean;
  claimed: boolean;
  image: string | null;
  photos: string[];
  phone: string | null;
  tradingHours: TradingHourPayload[];
}

// The API's field names differ slightly from the response above (location vs
// locationDescription) - see MapToResponse in VendorService.cs. Normalizing here keeps the rest
// of the app working with one consistent shape regardless of which field the API calls it.
interface RawVendorResponse extends Omit<VendorProfileResponse, 'locationDescription'> {
  location: string;
}

function normalize(raw: RawVendorResponse): VendorProfileResponse {
  const { location, ...rest } = raw;
  return { ...rest, locationDescription: location };
}

/** null means "no profile set up yet" (API returns 404) rather than an error - MySpazaScreen
 * uses this to decide between a blank form and a pre-filled edit form. */
export async function getMyProfile(accessToken: string): Promise<VendorProfileResponse | null> {
  try {
    const data = await apiClient.get<RawVendorResponse>('/vendors/me', accessToken);
    return normalize(data);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export interface UpsertVendorProfilePayload {
  businessName: string;
  description: string | null;
  categoryIds: string[];
  locationDescription: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string | null;
  tradingHours: TradingHourPayload[];
  imageUrl: string | null;
  photoUrls: string[];
}

export async function upsertMyProfile(
  payload: UpsertVendorProfilePayload,
  accessToken: string
): Promise<VendorProfileResponse> {
  const data = await apiClient.put<RawVendorResponse>('/vendors/me', payload, accessToken);
  return normalize(data);
}
