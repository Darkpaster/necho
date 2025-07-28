import { SendMessageDto } from '../../services/types';
interface Props {
    sendMessage: (messageDto: SendMessageDto) => void;
    error: string;
}
export default function ChatInput({ sendMessage, error }: Props): import("react/jsx-runtime").JSX.Element;
export {};
