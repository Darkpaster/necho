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
  chatId: string;
  senderId: string;
  sender: User;
  replyTo?: Message;
  edited?: boolean;
  editedAt?: Date;
  createdAt: Date;
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
}

export interface EditMessageDto {
  content: string;
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  isOnline?: boolean;
}
