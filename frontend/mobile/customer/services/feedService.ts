import { FeedResponse } from "../types/feed";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchFeed(): Promise<FeedResponse> {
    if (!API_URL) {
        throw new Error(
            "EXPO_PUBLIC_API_URL is not configured."
        );
    }

    const response = await fetch(`${API_URL}/feed`, {
        method: "GET",
        headers: {
            Accept: "*/*",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch feed. Status: ${response.status}`
        );
    }

    const data: FeedResponse = await response.json();

    return [...data].sort(
        (first, second) => second.likes - first.likes
    );
}