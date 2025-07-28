import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User } from '../services/types';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  selectCurrentUser,
  updateUser,
  clearUser,
  selectAuthLoading,
  selectAuthError,
  setAuthError,
  setAuthLoading,
  clearAuthError, selectIsAuthenticated, setUser,
} from '../store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  clearError: () => void;
  login: (loginDto: LoginDto) => Promise<void>;
  register: (registerDto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): AuthContextType {
  const dispatch = useAppDispatch();
  const user: User | null = useAppSelector(selectCurrentUser);
  const loading: boolean = useAppSelector(selectAuthLoading);
  const error: string = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const setLoading = (z: boolean) => {
    dispatch(setAuthLoading(z));
  };

  const setError = (error: string) => {
    dispatch(setAuthError(error));
  };

  const clearError = () => {
    dispatch(clearAuthError());
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        const isAuthenticated = await authService.checkAuthStatus();

        if (isAuthenticated) {
          try {
            const currentUser = await authService.getCurrentUser();
            dispatch(updateUser(currentUser));
          } catch (error) {
            setError(
              error instanceof Error ? error.message : 'Произошла ошибка',
            );
            console.error('Failed to get current user:', error);
            dispatch(clearUser());
          }
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Произошла ошибка');
        console.error('Auth check failed:', error);
        dispatch(clearUser());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  const login = async (loginDto: LoginDto) => {
    try {
      setLoading(true);
      const response = await authService.login(loginDto);
      dispatch(setUser(response.user));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerDto: RegisterDto) => {
    try {
      setLoading(true);
      const response = await authService.register(registerDto);
      dispatch(updateUser(response.user));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      dispatch(clearUser());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      console.error('Logout failed:', error);
      dispatch(clearUser());
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      dispatch(updateUser(response.user));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      console.error('Token refresh failed:', error);
      dispatch(clearUser());
      throw error;
    }
  };

  useEffect(() => {
    if (!user) return;

    // Refresh every 10 minutes (tokens expire in 30 minutes)
    const refreshInterval = setInterval(
      async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(refreshInterval);
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    clearError,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: isAuthenticated,
  };

  return value;
}
