import {
  addNotification,
  removeNotification,
  selectNotifications,
} from '../store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
  ) => {
    dispatch(addNotification({ type, message }));
  };

  const hideNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess: (message: string) => showNotification('success', message),
    showError: (message: string) => showNotification('error', message),
    showWarning: (message: string) => showNotification('warning', message),
    showInfo: (message: string) => showNotification('info', message),
  };
};
