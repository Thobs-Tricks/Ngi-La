import {
    ApiErrorResponse,
    CurrentUser,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/auth";
import { getAuthToken } from "../storage/authStorage";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

export async function registerCustomer(
    data: Omit<RegisterRequest, "userType">
): Promise<RegisterResponse> {
    if (!API_URL) {
        throw new Error(
            "API URL is not configured."
        );
    }

    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                Accept: "*/*",
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                userType: "Customer",
                ...data,
            }),
        }
    );

    const result =
        await response.json().catch(() => null);

    if (!response.ok) {
        const error =
            result as ApiErrorResponse | null;

        if (
            error?.errors &&
            Object.keys(error.errors).length > 0
        ) {
            const messages = Object.values(
                error.errors
            ).flat();

            throw new Error(
                messages.join("\n")
            );
        }

        throw new Error(
            error?.title ||
                "Registration failed. Please try again."
        );
    }

    return (
        result as RegisterResponse
    );
}

export async function loginCustomer(
    data: LoginRequest
): Promise<LoginResponse> {
    if (!API_URL) {
        throw new Error(
            "API URL is not configured."
        );
    }

    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                Accept: "*/*",
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    const result =
        await response.json().catch(() => null);

    if (!response.ok) {
        const error =
            result as ApiErrorResponse | null;

        if (
            error?.errors &&
            Object.keys(error.errors).length > 0
        ) {
            const messages = Object.values(
                error.errors
            ).flat();

            throw new Error(
                messages.join("\n")
            );
        }

        throw new Error(
            error?.title ||
                "Login failed. Please try again."
        );
    }

    return (
        result as LoginResponse
    );
}

export async function getCurrentUser(): Promise<
    CurrentUser
> {
    if (!API_URL) {
        throw new Error(
            "API URL is not configured."
        );
    }

    const token = await getAuthToken();

    if (!token) {
        throw new Error(
            "No authentication token found."
        );
    }

    const response = await fetch(
        `${API_URL}/auth/me`,
        {
            method: "GET",
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            "Authentication session has expired."
        );
    }

    const result =
        await response.json().catch(() => null);

    if (!response.ok) {
        const error =
            result as ApiErrorResponse | null;

        if (
            error?.errors &&
            Object.keys(error.errors).length > 0
        ) {
            const messages = Object.values(
                error.errors
            ).flat();

            throw new Error(
                messages.join("\n")
            );
        }

        throw new Error(
            error?.title ||
                "Failed to fetch current user."
        );
    }

    return result as CurrentUser;
}