import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    getCurrentUser,
} from "../services/authService";
import {
    CurrentUser,
} from "../types/auth";
import {
    getAuthToken,
} from "../storage/authStorage";

type AuthContextValue = {
    user: CurrentUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined
    );

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<CurrentUser | null>(null);

    const [loading, setLoading] =
        useState(true);

    const refreshUser = async () => {
        setLoading(true);

        try {
            const token =
                await getAuthToken();

            if (!token) {
                setUser(null);
                return;
            }

            const currentUser =
                await getCurrentUser();

            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated:
                    user !== null,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider."
        );
    }

    return context;
}