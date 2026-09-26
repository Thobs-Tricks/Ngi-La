// GET /categories — real, working endpoint (confirmed via a live response).
// Requires a Bearer token like the rest of the API.
import { apiClient } from './client';
import type { Category } from '../types';

export async function getCategories(accessToken?: string): Promise<Category[]> {
  return apiClient.get<Category[]>('/categories', accessToken);
}
