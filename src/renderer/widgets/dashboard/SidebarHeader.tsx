import { Moon, MoreVertical, Search, Sun } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../../providers/ThemeProvider';

export default function SidebarHeader() {
  const theme = useContext(ThemeContext);

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Necho
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={theme.toggleTheme}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme.themeName === 'light' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer" />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Поиск"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
    </div>
  );
}
