import type { AuthResponse, LoginDto, RegisterDto } from './types';
declare class AuthService {
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    logout(): Promise<{
        message: string;
    }>;
    isAuthenticated(): boolean;
}
export declare const authService: AuthService;
export {};
