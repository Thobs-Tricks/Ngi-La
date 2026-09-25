import { apiRequest } from "./api";
import type {
  ActivityItem,
  AdminStats,
  AdminUser,
  AdminVendor,
  AuthResponse,
  Category,
  CurrentUser,
  Gender,
  Report,
  UserType,
  VerificationQueueItem,
} from "./types";

// ---------- Auth ----------

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function register(input: {
  userType: UserType;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  gender?: Gender | null;
}) {
  return apiRequest<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: input,
    // Creating an Admin account requires the caller's own Admin session - sent when present so
    // the backend can authorize it; anonymous Customer/Vendor registration ignores it.
    auth: true,
  });
}

export function fetchMe() {
  return apiRequest<CurrentUser>("/api/auth/me");
}

export function revokeSession(refreshToken: string) {
  return apiRequest<{ message: string }>("/api/auth/revoke", {
    method: "POST",
    body: { refreshToken },
  });
}

// ---------- Dashboard ----------

export function fetchStats() {
  return apiRequest<AdminStats>("/api/admin/stats");
}

export function fetchActivity(take = 20) {
  return apiRequest<ActivityItem[]>(`/api/admin/activity?take=${take}`);
}

export function fetchAdminUsers() {
  return apiRequest<AdminUser[]>("/api/admin/users");
}

// ---------- Vendors ----------

export function fetchAdminVendors() {
  return apiRequest<AdminVendor[]>("/api/vendors/admin-list");
}

export function suspendVendor(id: string) {
  return apiRequest<AdminVendor>(`/api/vendors/${id}/suspend`, { method: "POST" });
}

export function unsuspendVendor(id: string) {
  return apiRequest<AdminVendor>(`/api/vendors/${id}/unsuspend`, { method: "POST" });
}

// ---------- Verification queue ----------

export function fetchVerificationQueue() {
  return apiRequest<VerificationQueueItem[]>("/api/vendors/verification-queue");
}

export function verifyVendor(id: string) {
  return apiRequest(`/api/vendors/${id}/verify`, { method: "POST" });
}

export function rejectClaim(id: string) {
  return apiRequest(`/api/vendors/${id}/reject-claim`, { method: "POST" });
}

export function requestVendorInfo(id: string, message: string) {
  return apiRequest(`/api/vendors/${id}/request-info`, {
    method: "POST",
    body: { message },
  });
}

// ---------- Categories ----------

export function fetchCategories() {
  return apiRequest<Category[]>("/api/categories");
}

export function createCategory(name: string) {
  return apiRequest<Category>("/api/categories", { method: "POST", body: { name } });
}

// ---------- Reports ----------

export function fetchReports() {
  return apiRequest<Report[]>("/api/admin/reports");
}

export function resolveReport(id: string) {
  return apiRequest<Report>(`/api/admin/reports/${id}/resolve`, { method: "POST" });
}
