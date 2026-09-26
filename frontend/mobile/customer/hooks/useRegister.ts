import { useState } from "react";
import {
    registerCustomer,
} from "../services/authService";
import {
    RegistrationErrors,
    RegistrationFormData,
    validateRegistrationForm,
} from "../utils/authValidation";

export default function useRegister() {
    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);

    const [validationErrors, setValidationErrors] =
        useState<RegistrationErrors>({});

    const register = async (
        data: RegistrationFormData
    ) => {
        setError(null);
        setSuccess(false);
        setSuccessMessage(null);

        const errors =
            validateRegistrationForm(data);

        setValidationErrors(errors);

        if (
            Object.keys(errors).length > 0
        ) {
            return false;
        }

        setLoading(true);

        try {
            const response =
                await registerCustomer({
                    firstName:
                        data.firstName.trim(),
                    lastName:
                        data.lastName.trim(),
                    gender: data.gender!,
                    phoneNumber:
                        data.phoneNumber.trim(),
                    email:
                        data.email.trim(),
                    password: data.password,
                });

            setSuccessMessage(
                response.message ||
                    "Your account has been created successfully."
            );

            setSuccess(true);

            return true;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed. Please try again."
            );

            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        register,
        loading,
        error,
        success,
        successMessage,
        validationErrors,
    };
}