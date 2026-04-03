import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtGuard } from 'src/auth/guards';
import { CurrentUser } from 'src/auth/decorators';
import { CreateTaskDto, UpdateTaskDto } from 'src/dtos';

@Controller('tasks')
@UseGuards(JwtGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateTaskDto,
  ) {
    const userId = user.sub;
    const task = await this.tasksService.create(userId, dto);
    return {
      message: 'task created successfully',
      data: task,
    };
  }

  @Get()
  async getAll(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    const [tasks, count] = await this.tasksService.getAll(userId);
    return {
      message: 'tasks listed successfully',
      meta: {
        itemsCount: count,
      },
      data: tasks,
    };
  }

  @Get('deleted')
  async getAllDeleted(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    const [tasks, count] = await this.tasksService.getAllDeleted(userId);
    return {
      message: 'deleted tasks listed successfully',
      meta: {
        itemsCount: count,
      },
      data: tasks,
    };
  }

  @Get(':taskId')
  async getOne(
    @CurrentUser() user: { sub: string },
    @Param('taskId') taskId: string,
  ) {
    const userId = user.sub;
    const task = await this.tasksService.getById(userId, taskId);
    return {
      message: 'task listed successfully',
      data: task,
    };
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: { sub: string },
    @Param('taskId') taskId: string,
  ) {
    const userId = user.sub;
    await this.tasksService.delete(userId, taskId);
    return {
      message: 'task deleted successfully',
    };
  }

  @Patch(':taskId')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: { sub: string },
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const userId = user.sub;
    await this.tasksService.update(userId, taskId, dto);
    return {
      message: 'task updated successfully',
    };
  }
}
