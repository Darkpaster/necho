import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Column } from 'typeorm';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;
}