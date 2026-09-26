import { useState } from "react";
import {
    loginCustomer,
} from "../services/authService";
import {
    LoginErrors,
    LoginFormData,
    validateLoginForm,
} from "../utils/authValidation";
import { LoginResponse } from "../types/auth";
import { setAuthToken } from "../storage/authStorage";

export default function useLogin() {
    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState(false);

    const [validationErrors, setValidationErrors] =
        useState<LoginErrors>({});

    const [loginResponse, setLoginResponse] =
        useState<LoginResponse | null>(null);

    const login = async (
        data: LoginFormData
    ) => {
        setError(null);
        setSuccess(false);
        setLoginResponse(null);

        const errors =
            validateLoginForm(data);

        setValidationErrors(errors);

        if (
            Object.keys(errors).length > 0
        ) {
            return false;
        }

        setLoading(true);

        try {
            const response =
                await loginCustomer({
                    email:
                        data.email.trim(),
                    password:
                        data.password,
                });

            setLoginResponse(response);

            const token =
                response.accessToken ||
                response.token ||
                response.refreshToken;

            if (token) {
                await setAuthToken(token);
            }

            setSuccess(true);

            return true;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed. Please try again."
            );

            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error,
        success,
        validationErrors,
        loginResponse,
    };
}