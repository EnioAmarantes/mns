export interface LoginResponse {
    token: string;
    companyId: string;
    companyName: string;
    userId: string;
    email: string;
    name: string;
    mustChangePassword?: boolean;
}

export interface ChangePasswordRequest {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

export type LoginResult =
    | { success: true; mustChangePassword: true; email: string }
    | { success: true; mustChangePassword: false; }
    | { success: false; error?: string };