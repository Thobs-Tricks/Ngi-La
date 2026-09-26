import { useCallback, useEffect, useState } from "react";
import {
    getCurrentUser,
} from "../services/authService";
import { CurrentUser } from "../types/auth";

export default function useCurrentUser() {
    const [user, setUser] =
        useState<CurrentUser | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const fetchCurrentUser =
        useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);

                return currentUser;
            } catch (err) {
                setUser(null);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch current user."
                );

                return null;
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    return {
        user,
        loading,
        error,
        fetchCurrentUser,
    };
}