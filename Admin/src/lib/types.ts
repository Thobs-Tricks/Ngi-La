// Response/request shapes mirrored from the backend DTOs (Ngila.Api/DTOs/**). Field names match
// the API's camelCase JSON exactly (ASP.NET Core's default naming policy).

export type UserType = "Customer" | "Vendor" | "Admin";
export type Gender = "Male" | "Female" | "Other";

export type AuthResponse = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type CurrentUser = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  gender: Gender | null;
  role: string;
  emailConfirmed: boolean;
  createdAt: string;
};

export type AdminStats = {
  totalVendors: number;
  pendingVerification: number;
  activeUsers: number;
};

// Public (unauthenticated) platform stats - GET /api/stats. Used on the login screen, which has
// no admin session yet to call the authenticated /api/admin/stats with.
export type PlatformStats = {
  vendorsMapped: number;
  communityReviews: number;
  areasLive: number;
};

export type ActivityItem = {
  id: string;
  who: string;
  what: string;
  when: string;
  tone: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  joined: string;
  vendorsAdded: number;
  reviewsWritten: number;
};

export type VendorAdminStatus = "Verified" | "Pending" | "Suspended";

export type AdminVendor = {
  id: string;
  name: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: VendorAdminStatus;
  rating: number;
  reviewsCount: number;
  addedBy: string | null;
  updated: string;
  image: string | null;
  claimed: boolean;
};

export type VerificationQueueItem = {
  id: string;
  businessName: string;
  category: string;
  location: string;
  claimantName: string;
  claimantEmail: string;
  addedByName: string | null;
  description: string | null;
  image: string | null;
  submittedAt: string;
};

export type Category = {
  id: string;
  name: string;
  vendorCount: number;
};

export type EmailSettings = {
  senderEmail: string | null;
  isConfigured: boolean;
  updatedAt: string | null;
};
