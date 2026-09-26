import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { fetchFeed } from "../services/feedService";
import { FeedItem } from "../types/feed";

export type FeedState = {
    feedItems: FeedItem[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
};

export default function useFeed() {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchFeedData = useCallback(async () => {
        try {
            setError(null);

            const data = await fetchFeed();

            setFeedItems(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load feed."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedData();
    }, [fetchFeedData]);

    const refresh = useCallback(async () => {
        try {
            setRefreshing(true);
            setError(null);

            const data = await fetchFeed();

            setFeedItems(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to refresh feed."
            );
        } finally {
            setRefreshing(false);
        }
    }, []);

    const filteredFeedItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return feedItems;
        }

        return feedItems.filter((item) =>
            [
                item.user,
                item.role,
                item.content,
                item.vendorName,
                item.vendorCategory,
            ].some((field) =>
                field.toLowerCase().includes(query)
            )
        );
    }, [feedItems, searchQuery]);

    return {
        feedItems,
        filteredFeedItems,
        loading,
        refreshing,
        error,
        refresh,
        searchQuery,
        setSearchQuery,
    };
}