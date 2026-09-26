// Vendor reviews, scored by how urgently they need the vendor's attention.
//
// GET /vendors/{vendorId}/reviews is real and confirmed live (2026-09):
// [{ id, reviewerName, rating, comment: string | null, time: "28m ago" }].
// The server sends time as an already-formatted relative string rather than
// an ISO date, so recency scoring below parses that string back into an
// approximate age instead of diffing real timestamps.
//
// There's no endpoint yet for marking a review as responded-to, so that bit
// stays a local, session-only toggle in the screen rather than part of this
// module's data.

export type ReviewSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface VendorReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  time: string;
}

export interface ScoredReview extends VendorReview {
  score: number;
  severity: ReviewSeverity;
  flags: string[];
  ageHours: number;
}

// Keyword weights feed into the urgency score — heavier words (safety,
// health, theft) count for more than everyday grumbles.
const CRITICAL_KEYWORDS = ['sick', 'food poisoning', 'unsafe', 'stole', 'stolen', 'threat', 'racist', 'assault'];
const MODERATE_KEYWORDS = ['rude', 'expired', 'dirty', 'overcharged', 'scam', 'never again', 'disrespect'];

function ratingWeight(rating: number): number {
  // 5★ → 0, 1★ → 4
  return 5 - rating;
}

function keywordWeight(comment: string): { weight: number; flags: string[] } {
  const text = comment.toLowerCase();
  const flags: string[] = [];
  let weight = 0;
  for (const word of CRITICAL_KEYWORDS) {
    if (text.includes(word)) {
      weight += 2;
      flags.push(word);
    }
  }
  for (const word of MODERATE_KEYWORDS) {
    if (text.includes(word)) {
      weight += 1;
      flags.push(word);
    }
  }
  return { weight, flags };
}

/** Parses the server's relative-time string ("just now", "28m ago", "3h
 * ago", "2d ago", "1w ago") into an approximate age in hours. Anything it
 * doesn't recognize is treated as old, so it doesn't skew toward "urgent". */
export function parseAgeHours(time: string): number {
  const t = time.trim().toLowerCase();
  if (t === 'just now' || t === 'now') return 0;
  const match = t.match(/^(\d+)\s*([mhdw])/);
  if (!match) return 999;
  const n = Number(match[1]);
  switch (match[2]) {
    case 'm':
      return n / 60;
    case 'h':
      return n;
    case 'd':
      return n * 24;
    case 'w':
      return n * 24 * 7;
    default:
      return 999;
  }
}

function recencyWeight(ageHours: number, rating: number): number {
  if (rating >= 4) return 0; // recency only matters for reviews that need a response
  return ageHours <= 48 ? 1 : 0;
}

/** Scores a review from 0 (nothing to worry about) upward, and buckets it
 * into a severity level a vendor can scan at a glance. `responded` is
 * passed in separately since the API doesn't track it. */
export function scoreReview(review: VendorReview, responded: boolean): ScoredReview {
  const { weight: kwWeight, flags } = keywordWeight(review.comment ?? '');
  const ageHours = parseAgeHours(review.time);
  const unrespondedWeight = !responded && review.rating <= 3 ? 1 : 0;
  const score = ratingWeight(review.rating) + kwWeight + recencyWeight(ageHours, review.rating) + unrespondedWeight;

  let severity: ReviewSeverity;
  if (score >= 6) severity = 'critical';
  else if (score >= 4) severity = 'high';
  else if (score >= 2) severity = 'medium';
  else severity = 'low';

  return { ...review, score, severity, flags, ageHours };
}

export const SEVERITY_LABEL: Record<ReviewSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
