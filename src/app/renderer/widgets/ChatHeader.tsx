import { MoreVertical, Phone } from 'lucide-react';

interface Props {
  chatName: string;
  status?: string;
  avatar?: string;
}

export default function ChatHeader({
  chatName,
  status,
  avatar = chatName.charAt(0) + chatName.charAt(1),
}: Props) {
  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
            {avatar}
          </div>
          <div>
            <h2 className="font-medium text-gray-900 dark:text-gray-100">
              {chatName}
            </h2>
            <p className="text-sm text-green-500 dark:text-green-400">
              {status ?? status}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200" />
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200" />
        </div>
      </div>
    </>
  );
}
