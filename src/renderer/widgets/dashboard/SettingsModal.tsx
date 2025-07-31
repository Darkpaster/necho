import { useContext } from 'react';
import ButtonContainer from '../../components/ButtonContainer';
import { ThemeContext } from '../../providers/ThemeProvider';
import {
  Bell,
  Binary,
  CircleQuestionMark,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import Modal from '../../components/Modal';
import { authService } from '../../services/authService';
import { clearUser } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const theme = useContext(ThemeContext);
  const dispatch = useAppDispatch();

  const logout = async () => { // TODO: дублирование кода, использовать redux
    try {
      await authService.logout();
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearUser());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'Настройки'}
      size="md"
      // className={className}
    >
      <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
        {/* Theme Setting */}
        <ButtonContainer onClick={theme.toggleTheme}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {theme.themeName === 'light' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
              )}
              <span className="text-gray-800 dark:text-gray-100">
                {theme.themeName === 'light' ? 'Светлая тема' : 'Темная тема'}
              </span>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-colors ${
                theme.themeName === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                  theme.themeName === 'dark'
                    ? 'translate-x-6'
                    : 'translate-x-0.5'
                }`}
              ></div>
            </div>
          </div>
        </ButtonContainer>

        {/* Other Settings */}
        <ButtonContainer>
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
            <span className="text-gray-800 dark:text-gray-100">Профиль</span>
          </div>
        </ButtonContainer>

        <ButtonContainer>
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
            <span className="text-gray-800 dark:text-gray-100">
              Общие настройки
            </span>
          </div>
        </ButtonContainer>

        <ButtonContainer>
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
          <div className="flex items-center">
            <span className="text-gray-800 dark:text-gray-100">
              Уведомления
            </span>
          </div>
        </ButtonContainer>

        <ButtonContainer>
          <Binary className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
          <div className="flex items-center">
            <span className="text-gray-800 dark:text-gray-100">
              Конфиденциальность
            </span>
          </div>
        </ButtonContainer>

        <ButtonContainer>
          <CircleQuestionMark className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
          <div className="flex items-center">
            <span className="text-gray-800 dark:text-gray-100">
              О приложении
            </span>
          </div>
        </ButtonContainer>

        <ButtonContainer onClick={logout}>
          <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
          <div className="flex items-center">
            <span className="text-gray-800 dark:text-gray-100">
              Выйти из аккаунта
            </span>
          </div>
        </ButtonContainer>
      </div>
    </Modal>
  );
}
