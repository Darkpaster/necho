import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username }
      ]
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email или username уже существует');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'firstName', 'lastName', 'avatar', 'isOnline', 'lastSeen'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'avatar', 'isOnline', 'lastSeen'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.isOnline !== undefined && !updateUserDto.isOnline) {
      updateUserDto['lastSeen'] = new Date();
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async updateOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const updateData: any = { isOnline };

    if (!isOnline) {
      updateData.lastSeen = new Date();
    }

    await this.usersRepository.update(id, updateData);
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere('(user.username ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query)',
        { query: `%${query}%` })
      .select(['user.id', 'user.username', 'user.firstName', 'user.lastName', 'user.avatar', 'user.isOnline'])
      .getMany();
  }
}