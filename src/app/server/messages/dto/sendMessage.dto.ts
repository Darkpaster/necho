import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '../message.entity';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}