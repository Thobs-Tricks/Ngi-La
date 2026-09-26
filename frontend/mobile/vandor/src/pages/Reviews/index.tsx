import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../layout/ScreenContainer';
import AppStatusBar from '../../components/AppStatusBar';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../styles/theme';
import { getMyVendor, getVendorReviews, VendorReviewRaw } from '../../api/vendors';
import { ReviewSeverity, SEVERITY_LABEL, ScoredReview, scoreReview } from '../../lib/reviews';

type FilterKey = 'all' | 'urgent' | 'unresponded' | 'positive' | 'negative';
type SortKey = 'urgent' | 'newest' | 'top' | 'low';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'unresponded', label: 'Unresponded' },
  { key: 'positive', label: 'Positive' },
  { key: 'negative', label: 'Negative' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'urgent', label: 'Most Urgent' },
  { key: 'newest', label: 'Newest' },
  { key: 'top', label: 'Top Rated' },
  { key: 'low', label: 'Lowest Rated' },
];

const SEVERITY_TINT: Record<ReviewSeverity, { badge: string; text: string; icon: keyof typeof Feather.glyphMap }> = {
  critical: { badge: 'bg-destructive/10 border-destructive/25', text: 'text-destructive', icon: 'alert-triangle' },
  high: { badge: 'bg-primary/10 border-primary/25', text: 'text-primary', icon: 'alert-circle' },
  medium: { badge: 'bg-accent/15 border-accent/30', text: 'text-accent-foreground', icon: 'info' },
  low: { badge: 'bg-verified/10 border-verified/25', text: 'text-verified', icon: 'check-circle' },
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ReviewsScreen() {
  const colors = useThemeColors();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [reviews, setReviews] = useState<VendorReviewRaw[]>([]);
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  const [filter, setFilter] = useState<FilterKey>('urgent');
  const [sort, setSort] = useState<SortKey>('urgent');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    setNoProfile(false);
    try {
      const vendor = await getMyVendor(session?.accessToken ?? '');
      if (!vendor?.id) {
        setNoProfile(true);
        return;
      }
      const data = await getVendorReviews(vendor.id, session?.accessToken);
      setReviews(data);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load your reviews — please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const scored: ScoredReview[] = useMemo(
    () => reviews.map((r) => scoreReview(r, respondedIds.has(r.id))),
    [reviews, respondedIds]
  );

  const stats = useMemo(() => {
    const total = scored.length;
    const avg = total ? scored.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const unresponded = scored.filter((r) => !respondedIds.has(r.id)).length;
    return { total, avg, unresponded };
  }, [scored, respondedIds]);

  const visible = useMemo(() => {
    let list = scored;
    if (filter === 'urgent') list = list.filter((r) => r.severity === 'critical' || r.severity === 'high');
    else if (filter === 'unresponded') list = list.filter((r) => !respondedIds.has(r.id));
    else if (filter === 'positive') list = list.filter((r) => r.rating >= 4);
    else if (filter === 'negative') list = list.filter((r) => r.rating <= 2);

    const sorted = [...list];
    if (sort === 'urgent') sorted.sort((a, b) => b.score - a.score);
    else if (sort === 'newest') sorted.sort((a, b) => a.ageHours - b.ageHours);
    else if (sort === 'top') sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === 'low') sorted.sort((a, b) => a.rating - b.rating);
    return sorted;
  }, [scored, filter, sort, respondedIds]);

  const toggleResponded = (id: string) => {
    setRespondedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center pt-6">
        <AppStatusBar />
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (noProfile) {
    return (
      <ScreenContainer className="items-center justify-center pt-6">
        <AppStatusBar />
        <Feather name="star" size={28} color={colors.mutedForeground} />
        <Text className="mt-4 text-center text-base font-semibold text-foreground">
          Set up your spaza first
        </Text>
        <Text className="mt-1.5 text-center text-sm leading-5 text-muted-foreground">
          Once your spaza profile is live, customer reviews will show up here.
        </Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="items-center justify-center pt-6">
        <AppStatusBar />
        <Feather name="alert-triangle" size={26} color={colors.destructive} />
        <Text className="mt-3 text-center text-sm text-destructive">{error}</Text>
        <View className="mt-5 w-full">
          <PrimaryButton label="Try Again" onPress={loadReviews} variant="outline" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll className="pt-6">
      <AppStatusBar />
      <Text className="text-2xl font-bold text-foreground">Customer Reviews</Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        Sorted by what needs your attention most — critical stuff floats to the top.
      </Text>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 items-center rounded-2xl border border-border bg-card py-3">
          <Text className="text-lg font-bold text-foreground">{stats.avg.toFixed(1)}</Text>
          <Text className="mt-0.5 text-[11px] text-muted-foreground">Avg Rating</Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-border bg-card py-3">
          <Text className="text-lg font-bold text-foreground">{stats.total}</Text>
          <Text className="mt-0.5 text-[11px] text-muted-foreground">Total Reviews</Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-border bg-card py-3">
          <Text className="text-lg font-bold text-destructive">{stats.unresponded}</Text>
          <Text className="mt-0.5 text-[11px] text-muted-foreground">Unresponded</Text>
        </View>
      </View>

      {stats.total === 0 ? (
        <View className="mt-8 items-center rounded-2xl border border-dashed border-border py-10">
          <Feather name="inbox" size={22} color={colors.mutedForeground} />
          <Text className="mt-2 text-sm text-muted-foreground">No reviews yet.</Text>
        </View>
      ) : (
        <>
          <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filter
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  className={`rounded-full border px-3.5 py-1.5 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sort by
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SORTS.map((s) => {
              const active = sort === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSort(s.key)}
                  className={`rounded-full border px-3.5 py-1.5 ${active ? 'border-foreground bg-foreground' : 'border-border bg-card'}`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-background' : 'text-foreground'}`}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mb-8 mt-5 gap-3">
            {visible.length === 0 && (
              <View className="items-center rounded-2xl border border-dashed border-border py-10">
                <Feather name="inbox" size={22} color={colors.mutedForeground} />
                <Text className="mt-2 text-sm text-muted-foreground">No reviews match this filter.</Text>
              </View>
            )}

            {visible.map((review) => {
              const tint = SEVERITY_TINT[review.severity];
              const isExpanded = !!expanded[review.id];
              const responded = respondedIds.has(review.id);
              const severityColor =
                review.severity === 'medium'
                  ? colors.accent
                  : review.severity === 'low'
                  ? colors.verified
                  : review.severity === 'high'
                  ? colors.primary
                  : colors.destructive;

              return (
                <View key={review.id} className="rounded-2xl border border-border bg-card p-4">
                  <View className="flex-row items-start gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Text className="text-xs font-semibold text-foreground">{initialsOf(review.reviewerName)}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-foreground">{review.reviewerName}</Text>
                        <Text className="text-xs text-muted-foreground">{review.time}</Text>
                      </View>
                      <View className="mt-1 flex-row items-center gap-2">
                        <View className="flex-row">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Feather
                              key={n}
                              name="star"
                              size={12}
                              color={n <= review.rating ? colors.accent : colors.border}
                              style={{ marginRight: 1 }}
                            />
                          ))}
                        </View>
                        <View className={`flex-row items-center gap-1 rounded-full border px-2 py-0.5 ${tint.badge}`}>
                          <Feather name={tint.icon} size={10} color={severityColor} />
                          <Text className={`text-[10px] font-semibold ${tint.text}`}>{SEVERITY_LABEL[review.severity]}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {review.comment ? (
                    <Pressable onPress={() => setExpanded((prev) => ({ ...prev, [review.id]: !isExpanded }))} className="mt-3">
                      <Text className="text-sm leading-5 text-foreground" numberOfLines={isExpanded ? undefined : 2}>
                        {review.comment}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text className="mt-3 text-sm italic leading-5 text-muted-foreground">No written comment</Text>
                  )}

                  {!!review.flags.length && (
                    <Text className="mt-2 text-[11px] font-medium text-destructive">
                      Flagged: {review.flags.join(', ')}
                    </Text>
                  )}

                  <View className="mt-3 flex-row items-center justify-end gap-2 border-t border-border pt-3">
                    <Pressable
                      onPress={() => toggleResponded(review.id)}
                      className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                        responded ? 'border-verified/30 bg-verified/10' : 'border-border bg-background'
                      }`}
                    >
                      <Feather
                        name={responded ? 'check' : 'message-circle'}
                        size={12}
                        color={responded ? colors.verified : colors.mutedForeground}
                      />
                      <Text className={`text-xs font-semibold ${responded ? 'text-verified' : 'text-muted-foreground'}`}>
                        {responded ? 'Responded' : 'Mark as Responded'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
