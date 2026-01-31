// interfaces/auth.ts

export interface AuthResponse {
    user: {
        id: number;
        username: string;
        email: string;
        isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    userId: number | null;
    accessToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean }>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean }>;
    logout: () => Promise<void>;
}
