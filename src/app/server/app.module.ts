import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { MessagesModule } from './messages/messages.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'necho',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // только для разработки

      // autoLoadEntities: true,
      // migrations: ['dist/migrations/*.js'],
    }),
    AuthModule,
    UsersModule,
    ChatsModule,
    MessagesModule,
  ],
})
export class AppModule {}
