import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { Suspense, useState } from 'react';
import LoadingContainer from '../components/LoadingContainer';

interface Props {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export default function AuthForm({ darkMode, setDarkMode }: Props) {
  const { login, register, loading, isAuthenticated } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login({ email, password });
      } else {
        await register({
          email: email,
          password: password,
          username: name,
          firstName: name,
          lastName: name,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const authContent = () => {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className={`min-h-1/2 min-w-1/2 flex items-center justify-center`}>
          <div
            className={`w-full max-w-1/2 p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="text-center mb-8">
              <h2
                className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}
              >
                {isLoginMode ? 'Вход в систему' : 'Регистрация'}
              </h2>
              <p
                className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {isLoginMode
                  ? 'Введите свои данные для входа'
                  : 'Создайте новый аккаунт'}
              </p>
            </div>

            <div className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label
                    className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Имя
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500'
                } text-white`}
              >
                {isSubmitting
                  ? 'Загрузка...'
                  : isLoginMode
                    ? 'Войти'
                    : 'Зарегистрироваться'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
              >
                {isLoginMode
                  ? 'Нет аккаунта? Зарегистрируйтесь'
                  : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>

            {/*<div className="mt-4 text-center">*/}
            {/*  <button*/}
            {/*    onClick={() => setDarkMode(!darkMode)}*/}
            {/*    className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}*/}
            {/*  >*/}
            {/*    {darkMode ? '☀️ Светлая тема' : '🌙 Темная тема'}*/}
            {/*  </button>*/}
            {/*</div>*/}

            {isLoginMode && (
              <div
                className={`mt-4 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <p
                  className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Тестовые данные:
                </p>
                <p
                  className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Email: test@example.com
                  <br />
                  Пароль: password
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const mainContent = () => {
    return (
      // <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Suspense fallback={<LoadingContainer />}>
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      </Suspense>
      // </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-white' : 'text-gray-800'}>
            Загрузка...
          </p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? mainContent() : authContent();
}
