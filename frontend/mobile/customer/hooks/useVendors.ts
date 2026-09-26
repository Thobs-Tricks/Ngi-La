import { useCallback, useEffect, useState } from "react";
import { getVendors } from "../services/vendorService";
import { Vendor } from "../types/vendor";

export default function useVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(
        null
    );

    const fetchVendors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await getVendors();

            setVendors(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch vendors."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    return {
        vendors,
        loading,
        error,
        refresh: fetchVendors,
    };
}