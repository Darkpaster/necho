import { IsString, IsOptional, IsArray, IsBoolean, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isGroup?: boolean = false;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @IsOptional()
  @IsString()
  avatar?: string;
}