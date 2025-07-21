import ChatHeader from './ChatHeader';
import MessageContainer from '../components/MessageContainer';
import ChatInput from './ChatInput';


export default function MainChatArea() {


  const messages = [
    {
      id: 1,
      text: 'Привет! Как дела?',
      time: '14:30',
      sent: false
    },
    {
      id: 2,
      text: 'Привет! Все отлично, спасибо! А у тебя как?',
      time: '14:32',
      sent: true
    },
    {
      id: 3,
      text: 'Тоже хорошо! Планы на выходные есть?',
      time: '14:33',
      sent: false
    },
    {
      id: 4,
      text: 'Думаю сходить в кино или на прогулку. Хочешь присоединиться?',
      time: '14:35',
      sent: true
    }
  ];


  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageContainer message={msg} />
          ))}
        </div>
      </div>

      <ChatInput />

    </div>
  )
}