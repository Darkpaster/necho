import React from 'react';
import AuthForm from './widgets/AuthForm';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './providers/ThemeProvider';
import { THEME_CONFIG } from './config/theme';

export default function Necho() {
  return (
    <ThemeProvider>
      <div
        className={`flex h-screen w-screen bg-gray-100 dark:bg-gray-900`}
      >
        <Provider store={store}>
          <AuthForm />
        </Provider>
      </div>
    </ThemeProvider>
  );
}
