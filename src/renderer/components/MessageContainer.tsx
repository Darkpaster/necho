import { Message } from '../services/types';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function MessageContainer({ message, isOwn }: Props) {
  return (
    <div
      key={message.id}
      className={`flex ${message.content ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            message.content
              ? 'text-blue-100 dark:text-blue-200'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {message.createdAt.toString()}
        </p>
      </div>
    </div>
  );
}
