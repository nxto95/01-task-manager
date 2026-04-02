import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dtos';
import { DataSource } from 'typeorm';
import { User } from './users.entity';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(dto: CreateUserDto) {
    const user = this.dataSource.manager.create(User, {
      username: dto.username,
      password: await argon.hash(dto.password),
    });
    return await this.dataSource.manager.save(User, user);
  }

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
