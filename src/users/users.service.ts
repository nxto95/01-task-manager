import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { CreateUserDto, UpdateUserDto } from 'src/dtos';
import { User } from 'src/auth/strategies/users.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
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
