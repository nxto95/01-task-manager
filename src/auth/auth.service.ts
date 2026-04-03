import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Response, Request } from 'express';
import { CreateUserDto, UpdateUserDto } from 'src/dtos';
import { User } from 'src/auth/strategies/users.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface IJwtPayload {
  sub: string;
}
export const SECRET = 'temp-secret-better-to-save-one-in-env-for-production';
export const ACCESS_TOKEN_KEY = 'access-tokens';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /* users logic [create - delete - update]*/
  async create(dto: CreateUserDto) {
    const existingUser = await this.findUserByUsername(dto.username);
    if (existingUser)
      throw new ConflictException('user with this username already exist');
    const user = this.dataSource.manager.create(User, {
      username: dto.username,
      password: await argon.hash(dto.password),
    });
    return await this.dataSource.manager.save(User, user);
  }

  async delete(id: string) {
    const deleteResult = await this.dataSource.manager.delete(User, id);
    if (deleteResult.affected === 0)
      throw new NotFoundException('user not found');
  }

  async update(userId: string, dto: UpdateUserDto) {
    const existingUser = await this.findUserByUsername(dto.username);
    if (existingUser)
      throw new ConflictException('user with this username already exist');
    const updateResult = await this.dataSource.manager.update(
      User,
      { id: userId },
      dto,
    );
    if (updateResult.affected === 0)
      throw new NotFoundException('user not found');
  }

  /* auth logic [validate - register - login - logout ]*/
  async validateUser(username: string, password: string) {
    const user = await this.findUserByUsername(username);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('invalid credentials');
    return user;
  }

  async register(dto: CreateUserDto, res: Response) {
    const user = await this.create(dto);
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
    const id = req.user as string;
    const payload: IJwtPayload = { sub: id };
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

  /* auth utility logic [generateAccessTokens]*/
  private async generateAccessTokens(payload: IJwtPayload) {
    return await this.jwt.signAsync(payload, {
      secret: SECRET,
      expiresIn: '7d',
    });
  }

  /* users utility logic [findUserById - findUserByUsername - updateUserStatus]*/
  async findUserById(id: string) {
    const user = await this.dataSource.manager.findOneBy(User, { id });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findUserByUsername(username: string) {
    const user = await this.dataSource.manager.findOneBy(User, { username });
    return user;
  }
}
