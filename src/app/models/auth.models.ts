export interface LoginResponse {
    message: string;
    user: {
        user_id: string;
        username: string;
        email: string;
        profile: {
            display_name: string;
            monedas: number;
        };
    };
    error?: string;
}

export interface RegisterResponse {
    message: string;
    user: {
        user_id: string;
        username: string;
        created_at: string;
    };
    error?: string;
}