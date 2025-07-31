import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'src/renderer/services/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastTokenRefresh: number | null;
  authError: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  lastTokenRefresh: null,
  authError: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authError = null;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.lastTokenRefresh = null;
      state.authError = null;
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setTokenRefreshTime: (state) => {
      state.lastTokenRefresh = Date.now();
    },

    setAuthError: (state, action: PayloadAction<string>) => {
      state.authError = action.payload;
    },

    clearAuthError: (state) => {
      state.authError = null;
    },

    authenticationFailed: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.lastTokenRefresh = null;
      state.authError = action.payload;
      state.isLoading = false;
    },

    tokenRefreshed: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.lastTokenRefresh = Date.now();
      state.authError = null;
    },
  },
});

export const {
  setUser,
  updateUser,
  clearUser,
  setAuthLoading,
  setTokenRefreshTime,
  setAuthError,
  clearAuthError,
  authenticationFailed,
  tokenRefreshed,
} = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;

export const selectLastTokenRefresh = (state: { auth: AuthState }) =>
  state.auth.lastTokenRefresh;

export const selectAuthError = (state: { auth: AuthState }) =>
  state.auth.authError;

export const selectUserFullName = (state: { auth: AuthState }) => {
  const user = state.auth.user;
  if (!user) return null;

  if (user.name) {
    return `${user.name}`;
  }

  return user.username;
};

export const selectIsTokenStale = (state: { auth: AuthState }) => {
  const lastRefresh = state.auth.lastTokenRefresh;
  if (!lastRefresh) return true;

  // Consider token stale if it hasn't been refreshed in 10 minutes
  const TEN_MINUTES = 10 * 60 * 1000;
  return Date.now() - lastRefresh > TEN_MINUTES;
};

export const selectAuthStatus = (state: { auth: AuthState }) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  hasError: !!state.auth.authError,
  error: state.auth.authError,
  user: state.auth.user,
});

export default authSlice.reducer;
