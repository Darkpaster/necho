import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from './user.entity.js';
import { JwtAuthGuard } from '../auth/jwtAuth.guard.js';
import { UpdateUserDto } from './dto/updateUser.dto.js';
import { GetUser } from '../auth/getUser.decorator.js';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@GetUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get('search')
  searchUsers(@Query('q') query: string, @GetUser() user: User) {
    return this.usersService.searchUsers(query, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  update(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }
}