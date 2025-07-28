import { IsString, IsOptional } from 'class-validator';

export class EditMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}