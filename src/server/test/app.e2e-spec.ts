import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Chat } from '../src/chats/chat.entity';
import { AppModule } from '../src/app.module';
import { Message } from '../src/messages/message.entity';

describe('Messenger API (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let chatRepository: Repository<Chat>;
  let messageRepository: Repository<Message>;
  let dataSource: DataSource;

  const user1: any = {
    email: 'user1@test.com',
    username: 'user1',
    password: 'password123',
    name: 'John',
  };

  const user2: any = {
    email: 'user2@test.com',
    username: 'user2',
    password: 'password123',
    name: 'Jane',
  };

  const user3: any = {
    email: 'user3@test.com',
    username: 'user3',
    password: 'password123',
    name: 'Bob',
  };

  let user1Token: string;
  let user2Token: string;
  let user3Token: string;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;

  beforeAll(async () => {
    const moduleFixture: Promise<TestingModule> = Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: 5432,
          username: process.env.TEST_DB_USER || 'postgres',
          password: process.env.TEST_DB_PASSWORD || 'password',
          database: process.env.TEST_DB_NAME || 'necho_test',
          entities: [User, Chat, Message],
          synchronize: true,
          dropSchema: true, // Очищаем БД перед тестами
        }),
        AppModule,
      ],
    }).compile();

    app = (await moduleFixture).createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    dataSource = app.get<DataSource>(getDataSourceToken());

    userRepository = (await moduleFixture).get('UserRepository');
    chatRepository = (await moduleFixture).get('ChatRepository');
    messageRepository = (await moduleFixture).get('MessageRepository');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Очищаем БД после каждого теста
    try {
      await messageRepository.query('TRUNCATE TABLE "messages" CASCADE');
      await chatRepository.query('TRUNCATE TABLE "chats" CASCADE');
      await userRepository.query('TRUNCATE TABLE "users" CASCADE');
    } catch (e) {
      console.error('Ошибка при очистке БД:', e);
      throw e;
    }
  });

  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('должен зарегистрировать нового пользователя', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(user1)
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(user1.email);
        expect(response.body.user.username).toBe(user1.username);
        expect(response.body.user).not.toHaveProperty('password');
      });

      it('должен вернуть ошибку при дублировании email', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(user1)
          .expect(201);

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ ...user1, username: 'different' })
          .expect(409);
      });

      it('должен валидировать входные данные', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: '123', // слишком короткий
          })
          .expect(400);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(user1);
      });

      it('должен авторизовать пользователя', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: user1.email,
            password: user1.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
      });

      it('должен отклонить неверные данные', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: user1.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });
  });

  describe('Users', () => {
    beforeEach(async () => {
      // Регистрируем пользователей и получаем токены
      const res1 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user1);
      user1Token = res1.body.access_token;
      user1Id = res1.body.user.id;

      const res2 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user2);
      user2Token = res2.body.access_token;
      user2Id = res2.body.user.id;

      const res3 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user3);
      user3Token = res3.body.access_token;
      user3Id = res3.body.user.id;
    });

    describe('GET /api/users/me', () => {
      it('должен вернуть профиль текущего пользователя', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/users/me')
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body.email).toBe(user1.email);
        expect(response.body.username).toBe(user1.username);
      });

      it('должен требовать авторизацию', async () => {
        await request(app.getHttpServer()).get('/api/users/me').expect(401);
      });
    });

    describe('GET /api/users/search', () => {
      it('должен найти пользователей по запросу', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/users/search?q=Jane')
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('Jane');
        expect(response.body[0].id).toBe(user2Id);
      });

      it('не должен возвращать текущего пользователя в поиске', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/users/search?q=John')
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(0);
      });
    });

    describe('PATCH /api/users/me', () => {
      it('должен обновить профиль пользователя', async () => {
        const updateData = {
          name: 'Johnny',
        };

        const response = await request(app.getHttpServer())
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe('Johnny');
      });
    });
  });

  describe('Chats', () => {
    beforeEach(async () => {
      // Регистрируем пользователей
      const res1 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user1);
      user1Token = res1.body.access_token;
      user1Id = res1.body.user.id;

      const res2 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user2);
      user2Token = res2.body.access_token;
      user2Id = res2.body.user.id;

      const res3 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user3);
      user3Token = res3.body.access_token;
      user3Id = res3.body.user.id;
    });

    describe('POST /api/chats', () => {
      it('должен создать приватный чат', async () => {
        const chatData = {
          participantIds: [user2Id],
          isGroup: false,
        };

        const response = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(chatData)
          .expect(201);

        expect(response.body.isGroup).toBe(false);
        expect(response.body.participants).toHaveLength(2);
        expect(
          response.body.participants.some(
            (p: { id: string }) => p.id === user1Id,
          ),
        ).toBe(true);
        expect(
          response.body.participants.some(
            (p: { id: string }) => p.id === user2Id,
          ),
        ).toBe(true);
      });

      it('должен создать групповой чат', async () => {
        const chatData = {
          name: 'Test Group',
          participantIds: [user2Id, user3Id],
          isGroup: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(chatData)
          .expect(201);

        expect(response.body.isGroup).toBe(true);
        expect(response.body.name).toBe('Test Group');
        expect(response.body.participants).toHaveLength(3);
      });

      it('должен вернуть существующий приватный чат', async () => {
        const chatData = {
          participantIds: [user2Id],
          isGroup: false,
        };

        // Создаем чат первый раз
        const response1 = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(chatData)
          .expect(201);

        // Создаем тот же чат второй раз
        const response2 = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(chatData)
          .expect(201);

        expect(response1.body.id).toBe(response2.body.id);
      });
    });

    describe('GET /api/chats', () => {
      it('должен вернуть список чатов пользователя', async () => {
        // Создаем несколько чатов
        await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ participantIds: [user2Id], isGroup: false });

        await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            name: 'Group Chat',
            participantIds: [user2Id, user3Id],
            isGroup: true,
          });

        const response = await request(app.getHttpServer())
          .get('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(2);
      });
    });

    describe('GET /api/chats/:id', () => {
      it('должен вернуть информацию о чате', async () => {
        const chatResponse = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ participantIds: [user2Id], isGroup: false });

        const response = await request(app.getHttpServer())
          .get(`/api/chats/${chatResponse.body.id}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body.id).toBe(chatResponse.body.id);
      });

      it('должен запретить доступ к чужому чату', async () => {
        const chatResponse = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ participantIds: [user2Id], isGroup: false });

        await request(app.getHttpServer())
          .get(`/api/chats/${chatResponse.body.id}`)
          .set('Authorization', `Bearer ${user3Token}`)
          .expect(404);
      });
    });

    describe('PATCH /api/chats/:id/participants', () => {
      it('должен добавить участника в групповой чат', async () => {
        const chatResponse = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            name: 'Group Chat',
            participantIds: [user2Id],
            isGroup: true,
          });

        const response = await request(app.getHttpServer())
          .patch(`/api/chats/${chatResponse.body.id}/participants`)
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ participantId: user3Id })
          .expect(200);

        expect(response.body.participants).toHaveLength(3);
      });

      it('должен запретить добавление участников в приватный чат', async () => {
        const chatResponse = await request(app.getHttpServer())
          .post('/api/chats')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ participantIds: [user2Id], isGroup: false });

        await request(app.getHttpServer())
          .patch(`/api/chats/${chatResponse.body.id}/participants`)
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ participantId: user3Id })
          .expect(403);
      });
    });
  });

  describe('Messages', () => {

    let chatId: string;

    beforeEach(async () => {
      // Регистрируем пользователей
      const res1 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user1);
      user1Token = res1.body.access_token;
      user1Id = res1.body.user.id;

      const res2 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user2);
      user2Token = res2.body.access_token;
      user2Id = res2.body.user.id;

      // Создаем чат
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantIds: [user2Id], isGroup: false });

      chatId = chatResponse.body.id;
    });

    describe('POST /api/messages', () => {
      it('должен отправить сообщение', async () => {
        const messageData = {
          chatId,
          content: 'Hello, world!',
          type: 'text',
        };

        const response = await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(messageData)
          .expect(201);

        expect(response.body.content).toBe('Hello, world!');
        expect(response.body.chatId).toBe(chatId);
        expect(response.body.sender.id).toBe(user1Id);
      });

      it('должен отправить сообщение с ответом', async () => {
        // Отправляем первое сообщение
        const firstMessage = await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: 'Original message',
            type: 'text',
          });

        // Отправляем ответ
        const response = await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            chatId,
            content: 'Reply message',
            type: 'text',
            replyToId: firstMessage.body.id,
          })
          .expect(201);

        expect(response.body.replyTo).toBeDefined();
        expect(response.body.replyTo.id).toBe(firstMessage.body.id);
        expect(response.body.replyTo.content).toBe('Original message');
      });

      it('должен запретить отправку в чужой чат', async () => {
        const res3 = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(user3);
        const user3Token = res3.body.access_token;

        await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user3Token}`)
          .send({
            chatId,
            content: 'Unauthorized message',
            type: 'text',
          })
          .expect(403);
      });
    });

    describe('GET /api/messages/chat/:chatId', () => {
      beforeEach(async () => {
        // Отправляем несколько сообщений
        for (let i = 1; i <= 5; i++) {
          await request(app.getHttpServer())
            .post('/api/messages')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
              chatId,
              content: `Message ${i}`,
              type: 'text',
            });
        }
      });

      it('должен получить сообщения чата', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/messages/chat/${chatId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(5);
        expect(response.body[0].content).toBe('Message 5'); // DESC order
        expect(response.body[4].content).toBe('Message 1');
      });

      it('должен поддерживать пагинацию', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/messages/chat/${chatId}?page=1&limit=2`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(2);
      });

      it('должен запретить доступ к чужому чату', async () => {
        const res3 = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(user3);
        const user3Token = res3.body.access_token;

        await request(app.getHttpServer())
          .get(`/api/messages/chat/${chatId}`)
          .set('Authorization', `Bearer ${user3Token}`)
          .expect(403);
      });
    });

    describe('PATCH /api/messages/:id', () => {
      let messageId: string;

      beforeEach(async () => {
        const messageResponse = await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: 'Original content',
            type: 'text',
          });

        messageId = messageResponse.body.id;
      });

      it('должен редактировать свое сообщение', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/messages/${messageId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            content: 'Edited content',
          })
          .expect(200);

        expect(response.body.content).toBe('Edited content');
        expect(response.body.edited).toBe(true);
        expect(response.body.editedAt).toBeDefined();
      });

      it('должен запретить редактирование чужого сообщения', async () => {
        await request(app.getHttpServer())
          .patch(`/api/messages/${messageId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            content: 'Unauthorized edit',
          })
          .expect(403);
      });
    });

    describe('DELETE /api/messages/:id', () => {
      let messageId: string;

      beforeEach(async () => {
        const messageResponse = await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: 'Message to delete',
            type: 'text',
          });

        messageId = messageResponse.body.id;
      });

      it('должен удалить свое сообщение', async () => {
        await request(app.getHttpServer())
          .delete(`/api/messages/${messageId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        // Проверяем, что сообщение действительно удалено
        await request(app.getHttpServer())
          .get(`/api/messages/${messageId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(404);
      });

      it('должен запретить удаление чужого сообщения', async () => {
        await request(app.getHttpServer())
          .delete(`/api/messages/${messageId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(403);
      });
    });

    describe('GET /api/messages/search/:chatId', () => {
      beforeEach(async () => {
        // Отправляем сообщения с разным содержимым
        await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: 'Hello world',
            type: 'text',
          });

        await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: 'Good morning',
            type: 'text',
          });

        await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: 'Hello again',
            type: 'text',
          });
      });

      it('должен найти сообщения по запросу', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/messages/search/${chatId}?q=hello`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(2);
        expect(
          response.body.every((msg: { content: string }) =>
            msg.content.toLowerCase().includes('hello'),
          ),
        ).toBe(true);
      });

      it('должен вернуть пустой результат для несуществующего запроса', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/messages/search/${chatId}?q=nonexistent`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveLength(0);
      });
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(async () => {
      // Регистрируем пользователей
      const res1 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user1);
      user1Token = res1.body.access_token;
      user1Id = res1.body.user.id;

      const res2 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user2);
      user2Token = res2.body.access_token;
      user2Id = res2.body.user.id;

      const res3 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user3);
      user3Token = res3.body.access_token;
      user3Id = res3.body.user.id;
    });

    it('полный сценарий: создание чата, отправка сообщений, поиск', async () => {
      // 1. Создаем групповой чат
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Team Chat',
          participantIds: [user2Id, user3Id],
          isGroup: true,
        })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Отправляем несколько сообщений от разных пользователей
      const msg1 = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'Привет команда!',
          type: 'text',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          chatId,
          content: 'Привет! Как дела?',
          type: 'text',
          replyToId: msg1.body.id,
        })
        .expect(201);

      const msg3 = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({
          chatId,
          content: 'Отлично! Работаем над проектом',
          type: 'text',
        })
        .expect(201);

      // 3. Получаем все сообщения
      const messagesResponse = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(messagesResponse.body).toHaveLength(3);

      // 4. Редактируем последнее сообщение
      await request(app.getHttpServer())
        .patch(`/api/messages/${msg3.body.id}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .send({
          content: 'Отлично! Работаем над проектом (отредактировано)',
        })
        .expect(200);

      // 5. Ищем сообщения
      const searchResponse = await request(app.getHttpServer())
        .get(`/api/messages/search/${chatId}?q=проект`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(searchResponse.body).toHaveLength(1);
      expect(searchResponse.body[0].edited).toBe(true);

      // 6. Получаем список чатов пользователя
      const chatsResponse = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(chatsResponse.body).toHaveLength(1);
      expect(chatsResponse.body[0].name).toBe('Team Chat');
    });

    it('сценарий приватного чата с проверкой доступа', async () => {
      // 1. User1 создает приватный чат с User2
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantIds: [user2Id],
          isGroup: false,
        })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Отправляем сообщения между User1 и User2
      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'Приватное сообщение',
          type: 'text',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          chatId,
          content: 'Ответ на приватное сообщение',
          type: 'text',
        })
        .expect(201);

      // 3. User3 не должен иметь доступ к чату
      await request(app.getHttpServer())
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(404);

      // 4. User3 не может отправлять сообщения в чат
      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({
          chatId,
          content: 'Несанкционированное сообщение',
          type: 'text',
        })
        .expect(403);

      // 5. User3 не может читать сообщения чата
      await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(403);

      // 6. User1 и User2 видят чат в своем списке чатов
      const user1Chats = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const user2Chats = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user1Chats.body).toHaveLength(1);
      expect(user2Chats.body).toHaveLength(1);

      // 7. User3 не видит чат в своем списке
      const user3Chats = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(200);

      expect(user3Chats.body).toHaveLength(0);
    });

    it('сценарий управления групповым чатом', async () => {
      // 1. User1 создает групповой чат
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Тестовая группа',
          participantIds: [user2Id],
          isGroup: true,
        })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Добавляем User3 в группу
      await request(app.getHttpServer())
        .patch(`/api/chats/${chatId}/participants`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ participantId: user3Id })
        .expect(200);

      // 3. Проверяем, что все участники видят чат
      const user1Chats = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const user2Chats = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      const user3Chats = await request(app.getHttpServer())
        .get('/api/chats')
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(200);

      expect(user1Chats.body).toHaveLength(1);
      expect(user2Chats.body).toHaveLength(1);
      expect(user3Chats.body).toHaveLength(1);

      // 4. Все участники могут отправлять сообщения
      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'Сообщение от создателя',
          type: 'text',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({
          chatId,
          content: 'Сообщение от нового участника',
          type: 'text',
        })
        .expect(201);

      // 5. Обновляем информацию о чате
      const updatedChat = await request(app.getHttpServer())
        .patch(`/api/chats/${chatId}/info`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Обновленная группа',
          avatar: 'new-avatar-url',
        })
        .expect(200);

      expect(updatedChat.body.name).toBe('Обновленная группа');
      expect(updatedChat.body.avatar).toBe('new-avatar-url');

      // 6. Получаем сообщения и проверяем участников
      const messages = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(messages.body).toHaveLength(2);
    });

    it('сценарий работы с вложениями и разными типами сообщений', async () => {
      // 1. Создаем чат
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantIds: [user2Id],
          isGroup: false,
        })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Отправляем текстовое сообщение
      const textMessage = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'Обычное текстовое сообщение',
          type: 'text',
        })
        .expect(201);

      // 3. Отправляем сообщение с изображением
      const imageMessage = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          chatId,
          content: 'image.jpg',
          type: 'image',
          attachmentUrl: 'https://example.com/image.jpg',
        })
        .expect(201);

      // 4. Отправляем файл
      const fileMessage = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'document.pdf',
          type: 'file',
          attachmentUrl: 'https://example.com/document.pdf',
        })
        .expect(201);

      // 5. Отправляем ответ на текстовое сообщение
      const replyMessage = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          chatId,
          content: 'Ответ на текстовое сообщение',
          type: 'text',
          replyToId: textMessage.body.id,
        })
        .expect(201);

      // 6. Проверяем типы сообщений
      const messages = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(messages.body).toHaveLength(4);

      const sortedMessages = messages.body.sort(
        (
          a: { createdAt: string | number | Date },
          b: { createdAt: string | number | Date },
        ) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      expect(sortedMessages[0].type).toBe('text');
      expect(sortedMessages[1].type).toBe('image');
      expect(sortedMessages[1].attachmentUrl).toBe(
        'https://example.com/image.jpg',
      );
      expect(sortedMessages[2].type).toBe('file');
      expect(sortedMessages[2].attachmentUrl).toBe(
        'https://example.com/document.pdf',
      );
      expect(sortedMessages[3].replyTo).toBeDefined();
      expect(sortedMessages[3].replyTo.id).toBe(textMessage.body.id);
    });

    it('сценарий поиска пользователей и создания чатов', async () => {
      // 1. User1 ищет пользователей по имени
      const searchByName = await request(app.getHttpServer())
        .get('/api/users/search?q=Jane')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(searchByName.body).toHaveLength(1);
      expect(searchByName.body[0].name).toBe('Jane');

      // 2. Поиск по username
      const searchByUsername = await request(app.getHttpServer())
        .get('/api/users/search?q=user3')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(searchByUsername.body).toHaveLength(1);
      expect(searchByUsername.body[0].username).toBe('user3');

      // 3. Поиск по частичному совпадению
      const searchPartial = await request(app.getHttpServer())
        .get('/api/users/search?q=Joh')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(searchPartial.body).toHaveLength(1);
      expect(searchPartial.body[0].name).toBe('John');

      // 4. Создаем чат с найденным пользователем
      const foundUserId = searchByName.body[0].id;
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantIds: [foundUserId],
          isGroup: false,
        })
        .expect(201);

      expect(chatResponse.body.participants).toHaveLength(2);
      expect(
        chatResponse.body.participants.some(
          (p: { id: any }) => p.id === foundUserId,
        ),
      ).toBe(true);
    });

    it('сценарий редактирования и удаления сообщений', async () => {
      // 1. Создаем чат
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantIds: [user2Id],
          isGroup: false,
        })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Отправляем сообщения
      const message1 = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'Первое сообщение',
          type: 'text',
        })
        .expect(201);

      const message2 = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          chatId,
          content: 'Второе сообщение',
          type: 'text',
        })
        .expect(201);

      const message3 = await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId,
          content: 'Третье сообщение для удаления',
          type: 'text',
        })
        .expect(201);

      // 3. Редактируем свое сообщение
      const editedMessage = await request(app.getHttpServer())
        .patch(`/api/messages/${message1.body.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Первое сообщение (отредактировано)',
        })
        .expect(200);

      expect(editedMessage.body.content).toBe(
        'Первое сообщение (отредактировано)',
      );
      expect(editedMessage.body.edited).toBe(true);
      expect(editedMessage.body.editedAt).toBeDefined();

      // 4. Пытаемся редактировать чужое сообщение (должно быть запрещено)
      await request(app.getHttpServer())
        .patch(`/api/messages/${message2.body.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Попытка редактировать чужое сообщение',
        })
        .expect(403);

      // 5. Удаляем свое сообщение
      await request(app.getHttpServer())
        .delete(`/api/messages/${message3.body.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // 6. Проверяем, что сообщение удалено
      await request(app.getHttpServer())
        .get(`/api/messages/${message3.body.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      // 7. Пытаемся удалить чужое сообщение (должно быть запрещено)
      await request(app.getHttpServer())
        .delete(`/api/messages/${message2.body.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      // 8. Проверяем оставшиеся сообщения
      const remainingMessages = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(remainingMessages.body).toHaveLength(2);
      expect(
        remainingMessages.body.some(
          (m: { edited: boolean }) => m.edited === true,
        ),
      ).toBe(true);
    });

    it('сценарий статуса пользователей онлайн/офлайн', async () => {
      // 1. Проверяем, что после регистрации пользователи онлайн
      const user1Profile = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(user1Profile.body.isOnline).toBe(true);

      // 2. Выходим из системы
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // 3. Проверяем статус через другого пользователя
      const user1Info = await request(app.getHttpServer())
        .get(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user1Info.body.isOnline).toBe(false);
      expect(user1Info.body.lastSeen).toBeDefined();
    });

    it('сценарий пагинации сообщений', async () => {
      // 1. Создаем чат
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantIds: [user2Id],
          isGroup: false,
        })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Отправляем 15 сообщений
      for (let i = 1; i <= 15; i++) {
        await request(app.getHttpServer())
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId,
            content: `Сообщение номер ${i}`,
            type: 'text',
          })
          .expect(201);
      }

      // 3. Получаем первые 10 сообщений
      const page1 = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}?page=1&limit=10`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(page1.body).toHaveLength(10);
      expect(page1.body[0].content).toBe('Сообщение номер 15'); // последнее сообщение первое

      // 4. Получаем следующие 5 сообщений
      const page2 = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}?page=2&limit=10`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(page2.body).toHaveLength(5);
      expect(page2.body[4].content).toBe('Сообщение номер 1'); // самое первое сообщение последнее

      // 5. Проверяем пустую страницу
      const page3 = await request(app.getHttpServer())
        .get(`/api/messages/chat/${chatId}?page=3&limit=10`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(page3.body).toHaveLength(0);
    });

    it('сценарий валидации данных и обработки ошибок', async () => {
      // 1. Попытка создать чат без авторизации
      await request(app.getHttpServer())
        .post('/api/chats')
        .send({
          participantIds: [user2Id],
          isGroup: false,
        })
        .expect(401);

      // 2. Попытка отправить сообщение с невалидными данными
      const chatResponse = await request(app.getHttpServer())
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participantIds: [user2Id],
          isGroup: false,
        })
        .expect(201);

      // Пустое содержимое сообщения
      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId: chatResponse.body.id,
          content: '',
          type: 'text',
        })
        .expect(400);

      // Неверный тип сообщения
      await request(app.getHttpServer())
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId: chatResponse.body.id,
          content: 'test',
          type: 'invalid_type',
        })
        .expect(400);

      // 3. Попытка доступа к несуществующему чату
      await request(app.getHttpServer())
        .get('/api/chats/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      // 4. Попытка обновления профиля с невалидными данными
      await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });
});

export class TestHelper {
  static async createTestUser(app: INestApplication, userData: any) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userData);

    return {
      token: response.body.access_token,
      user: response.body.user,
    };
  }

  static async createTestChat(
    app: INestApplication,
    token: string,
    chatData: any,
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(chatData);

    return response.body;
  }

  static async sendTestMessage(
    app: INestApplication,
    token: string,
    messageData: any,
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send(messageData);

    return response.body;
  }

  static generateTestUser(index: number) {
    return {
      email: `testuser${index}@example.com`,
      username: `testuser${index}`,
      password: 'password123',
      name: `Test${index}`,
    };
  }
}
