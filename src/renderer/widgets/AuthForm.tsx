import Sidebar from './dashboard/Sidebar';
import { useAuth } from '../hooks/api/useAuth';
import { Suspense, useEffect, useState } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/preload/LoadingSpinner';

export default function AuthForm() {
  const { login, register, loading, isAuthenticated, error } =
    useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login({ email, password });
      } else {
        await register({
          email: email,
          password: password,
          username: name,
          name: name,
        });
      }
    } catch (error) {
      // setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!error) {
      console.warn(`is authenticated: ${isAuthenticated}`);
    }
  });

  const authContent = () => {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className={`min-h-1/2 min-w-1/2 flex items-center justify-center`}>
          <div
            className={`w-full max-w-1/2 min-w-2xs p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800`}
          >
            <div className="text-center mb-8">
              <h2
                className={`text-2xl font-bold  text-gray-700 dark:text-gray-300`}
              >
                Necho
              </h2>
              <p className={`mt-2 text-sm text-gray-600 dark:text-gray-400`}>
                {isLoginMode
                  ? 'Введите свои данные для входа'
                  : 'Создайте новый аккаунт'}
              </p>
            </div>

            <div className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300`}
                  >
                    Имя
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  />
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
              </div>

              <div className={'mb-8'}>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300`}
                >
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button
                onClick={() => {
                  handleSubmit();
                }}
              >
                {isSubmitting
                  ? 'Загрузка...'
                  : isLoginMode
                    ? 'Войти'
                    : 'Зарегистрироваться'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className={`text-sm dark:text-blue-400 dark:hover:text-blue-300 text-blue-500 hover:text-blue-600`}
              >
                {isLoginMode
                  ? 'Нет аккаунта? Зарегистрируйтесь'
                  : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Sidebar /> : authContent();
}
