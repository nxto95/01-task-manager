import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as argon from 'argon2';
import { Response, Request } from 'express';
import { CreateUserDto } from 'src/dtos';

export interface IJwtPayload {
  sub: string;
}
export const SECRET = 'temp-secret-better-to-save-one-in-env-for-production';
export const ACCESS_TOKEN_KEY = 'access-tokens';

export interface IUser {
  userId: string;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findUserByUsername(username);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('invalid credentials');
    return user;
  }

  async register(dto: CreateUserDto, res: Response) {
    const user = await this.usersService.create(dto);
    const payload: IJwtPayload = { sub: user.id };
    const accessToken = await this.generateAccessTokens(payload);
    res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'development',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return accessToken;
  }

  async login(req: Request, res: Response) {
    const userId = req.user as string;
    const payload: IJwtPayload = { sub: userId };
    const accessToken = await this.generateAccessTokens(payload);
    res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'development',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return accessToken;
  }

  logout(res: Response) {
    return res.clearCookie(ACCESS_TOKEN_KEY, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'development',
    });
  }

  private async generateAccessTokens(payload: IJwtPayload) {
    return await this.jwt.signAsync(payload, {
      secret: SECRET,
      expiresIn: '7d',
    });
  }
}
