import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateTaskDto, UpdateTaskDto } from 'src/dtos';
import { DataSource, IsNull, Not } from 'typeorm';
import { Task, TaskStatus } from './task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(userId: string, dto: CreateTaskDto) {
    const task = this.dataSource.manager.create(Task, {
      title: dto.title,
      description: dto.description,
      author: userId,
    });
    return await this.dataSource.manager.save(Task, task);
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const updateResult = await this.dataSource.manager.update(
      Task,
      {
        id: taskId,
        author: userId,
      },
      dto,
    );
    if (updateResult.affected === 0)
      throw new NotFoundException('task not found');
    return updateResult;
  }

  async delete(userId: string, taskId: string) {
    const deleteResult = await this.dataSource.manager.softDelete(Task, {
      id: taskId,
      author: userId,
    });

    if (deleteResult.affected === 0) {
      throw new NotFoundException('task not found');
    }
    await this.dataSource.manager.update(Task, taskId, {
      status: TaskStatus.DELETED,
    });

    return deleteResult;
  }

  async getAll(userId: string) {
    return await this.dataSource.manager.findAndCount(Task, {
      where: { author: userId },
    });
  }

  async getById(userId: string, taskId: string) {
    const task = await this.dataSource.manager.findOne(Task, {
      where: {
        id: taskId,
        author: userId,
      },
    });
    if (!task) throw new NotFoundException('task not found');
    return task;
  }

  async getAllDeleted(userId: string) {
    return await this.dataSource.manager.findAndCount(Task, {
      where: { author: userId, deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  async restoreDeletedTask(userId: string, taskId: string) {
    const task = await this.dataSource.manager.findOne(Task, {
      where: {
        id: taskId,
        author: userId,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });
    if (!task) throw new NotFoundException('task not found');

    const restoreResult = await this.dataSource.manager.restore(Task, {
      id: taskId,
    });
    if (restoreResult.affected === 0) {
      throw new NotFoundException('task not found');
    }
    await this.dataSource.manager.update(Task, taskId, {
      status: TaskStatus.IN_PROGRESS,
    });
  }

  async deleteAllDeletedTasks(userId: string) {
    return await this.dataSource.manager.delete(Task, {
      author: userId,
      deletedAt: Not(IsNull()),
    });
  }
}
