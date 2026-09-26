import { Vendor, VendorResponse } from "../types/vendor";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

export async function getVendors(): Promise<VendorResponse> {
    if (!API_URL) {
        throw new Error(
            "API URL is not configured."
        );
    }

    const response = await fetch(
        `${API_URL}/vendors`,
        {
            method: "GET",
            headers: {
                Accept: "*/*",
            },
        }
    );

    const result =
        await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            "Failed to fetch vendors."
        );
    }

    const vendors =
        result as VendorResponse;

    return [...vendors].sort((a, b) => {
        const aDistance =
            a.latitude === null ||
            a.longitude === null
                ? Number.POSITIVE_INFINITY
                : a.distance;

        const bDistance =
            b.latitude === null ||
            b.longitude === null
                ? Number.POSITIVE_INFINITY
                : b.distance;

        return aDistance - bDistance;
    });
}