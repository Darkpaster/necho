interface Props {
  message: MessageType;
}

export type MessageType = {
  id: number;
  text: string;
  time: string;
  sent: boolean;
}

export default function MessageContainer( { message }: Props) {

  return (
    <div
      key={message.id}
      className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.sent
            ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            message.sent
              ? 'text-blue-100 dark:text-blue-200'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  )
}