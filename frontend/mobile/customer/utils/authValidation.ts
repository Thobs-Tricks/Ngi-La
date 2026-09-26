import { Gender } from "../types/gender";

export type RegistrationFormData = {
    firstName: string;
    lastName: string;
    gender: Gender | null;
    phoneNumber: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
};

export type RegistrationErrors = {
    firstName?: string;
    lastName?: string;
    gender?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    acceptedTerms?: string;
};

export function validateRegistrationForm(
    data: RegistrationFormData
): RegistrationErrors {
    const errors: RegistrationErrors = {};

    if (!data.firstName.trim()) {
        errors.firstName =
            "First name is required.";
    }

    if (!data.lastName.trim()) {
        errors.lastName =
            "Last name is required.";
    }

    if (!data.gender) {
        errors.gender =
            "Gender is required.";
    }

    const phone = data.phoneNumber.trim();

    if (!phone) {
        errors.phoneNumber =
            "Phone number is required.";
    } else if (
        !/^[0-9+\s()-]{7,}$/.test(phone)
    ) {
        errors.phoneNumber =
            "Enter a valid phone number.";
    }

    const email = data.email.trim();

    if (!email) {
        errors.email =
            "Email is required.";
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.email =
            "Enter a valid email address.";
    }

    if (!data.password) {
        errors.password =
            "Password is required.";
    } else if (data.password.length < 8) {
        errors.password =
            "Password must be at least 8 characters long.";
    } else if (!/[A-Z]/.test(data.password)) {
        errors.password =
            "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(data.password)) {
        errors.password =
            "Password must contain at least one digit.";
    } else if (
        !/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(
            data.password
        )
    ) {
        errors.password =
            "Password must contain at least one special character.";
    }

    if (!data.acceptedTerms) {
        errors.acceptedTerms =
            "You must accept the Terms & Conditions.";
    }

    return errors;
}

export type LoginFormData = {
    email: string;
    password: string;
};

export type LoginErrors = {
    email?: string;
    password?: string;
};

export function validateLoginForm(
    data: LoginFormData
): LoginErrors {
    const errors: LoginErrors = {};

    const email = data.email.trim();

    if (!email) {
        errors.email =
            "Email is required.";
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.email =
            "Enter a valid email address.";
    }

    if (!data.password) {
        errors.password =
            "Password is required.";
    }

    return errors;
}