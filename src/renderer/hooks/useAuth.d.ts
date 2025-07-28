import { ReactNode } from 'react';
import { LoginDto, RegisterDto, User } from '../services/types';
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (loginDto: LoginDto) => Promise<void>;
    register: (registerDto: RegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
