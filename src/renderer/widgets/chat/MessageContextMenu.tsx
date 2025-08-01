import { Edit3, Trash2, Reply, Copy, Forward } from 'lucide-react';
import { ContextMenu, ContextMenuItem } from '../../components/ContextMenu';
import { ContextMenuPosition } from '../../hooks/ui/useContextMenu';

export interface MessageContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  onCopy?: () => void;
  onForward?: () => void;
  isOwn: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function MessageContextMenu({
  isOpen,
  position,
  onClose,
  onEdit,
  onDelete,
  onReply,
  onCopy,
  onForward,
  isOwn,
  canEdit = true,
  canDelete = true,
}: MessageContextMenuProps) {
  const items: ContextMenuItem[] = [
    {
      id: 'reply',
      label: 'Ответить',
      icon: <Reply className="w-4 h-4" />,
      onClick: () => onReply?.(),
    },
    {
      id: 'copy',
      label: 'Копировать текст',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => onCopy?.(),
    },
    {
      id: 'forward',
      label: 'Переслать',
      icon: <Forward className="w-4 h-4" />,
      onClick: () => onForward?.(),
    },
  ];

  if (isOwn) {
    items.push({ id: 'separator-1', separator: true } as ContextMenuItem);

    if (canEdit) {
      items.push({
        id: 'edit',
        label: 'Редактировать',
        icon: <Edit3 className="w-4 h-4" />,
        onClick: () => onEdit?.(),
      });
    }

    if (canDelete) {
      items.push({
        id: 'delete',
        label: 'Удалить',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => onDelete?.(),
        destructive: true,
      });
    }
  }

  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      items={items}
      onClose={onClose}
    />
  );
}
