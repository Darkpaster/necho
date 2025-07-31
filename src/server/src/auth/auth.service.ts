import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, response: Response) {
    const user = await this.usersService.create(registerDto);

    const payload = { username: user.username, sub: user.id };
    const tokens = await this.generateTokens(payload);

    this.setAuthCookies(response, tokens.access_token, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    await this.usersService.updateOnlineStatus(user.id, true);

    const payload = { username: user.username, sub: user.id };
    const tokens = await this.generateTokens(payload);

    this.setAuthCookies(response, tokens.access_token, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async logout(userId: string, response: Response) {
    await this.usersService.updateOnlineStatus(userId, false);

    this.clearAuthCookies(response);

    return { message: 'Успешно выполнен выход' };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(request: any, response: Response) {
    const refreshToken = this.extractRefreshTokenFromCookies(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не найден');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      const newPayload = { username: user.username, sub: user.id };
      const tokens = await this.generateTokens(newPayload);

      this.setAuthCookies(response, tokens.access_token, tokens.refresh_token);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  /**
   * Verify if user is authenticated by validating JWT token
   */
  async verifyUser(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  /**
   * Check if user is authenticated from request cookies
   */
  async isAuthenticated(request: any) {
    try {
      const token = this.extractTokenFromCookies(request);
      if (!token) {
        return false;
      }

      await this.verifyUser(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current authenticated user from request
   */
  async getCurrentUser(request: any) {
    const token = this.extractTokenFromCookies(request);
    if (!token) {
      throw new UnauthorizedException('Токен не найден');
    }

    return this.verifyUser(token);
  }

  /**
   * Generate both access and refresh tokens
   */
  private async generateTokens(payload: any) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  /**
   * Extract JWT access token from cookies
   */
  private extractTokenFromCookies(request: any): string | null {
    return request.cookies?.['access-token'] || null;
  }

  /**
   * Extract JWT refresh token from cookies
   */
  private extractRefreshTokenFromCookies(request: any): string | null {
    return request.cookies?.['refresh-token'] || null;
  }

  /**
   * Set HTTP-only authentication cookies
   */
  private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/',
    });

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(response: Response) {
    response.clearCookie('access-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    response.clearCookie('refresh-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}