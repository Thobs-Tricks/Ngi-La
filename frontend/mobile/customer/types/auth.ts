import { Gender } from "./gender";

export type RegisterRequest = {
    userType: "Customer";
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    gender: Gender;
};

export type RegisterResponse = {
    message?: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    message?: string;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    [key: string]: unknown;
};

export type CurrentUser = {
    firstName: string;
    lastName: string;
};

export type ApiValidationErrors = {
    [field: string]: string[];
};

export type ApiErrorResponse = {
    type?: string;
    title?: string;
    status?: number;
    errors?: ApiValidationErrors;
    traceId?: string;
};