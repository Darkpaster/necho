export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Chat {
  id: string;
  name?: string;
  avatar?: string;
  isGroup: boolean;
  participants: User[];
  messages?: Message[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  fileName?: string;
  fileUrl?: string;
  edited: boolean;
  createdAt: Date;
  editedAt?: Date;
  sender: User;
  senderId: string;
  chatId: string;
  replyTo?: Message;
  replyToId?: string;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
}

export interface SendMessagePayload {
  content: string;
  chatId: string;
  type?: MessageType;
  fileName?: string;
  fileUrl?: string;
  replyToId?: string;
}

export interface EditMessagePayload {
  content: string;
  fileName?: string;
  fileUrl?: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  chatId: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface CreateChatDto {
  participantIds: string[];
  isGroup: boolean;
  name?: string;
  avatar?: string;
}

export interface SendMessageDto {
  chatId: string;
  content: string;
  replyToId?: string;
  type: MessageType;
}

export interface EditMessageDto {
  content: string;
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  isOnline?: boolean;
}
