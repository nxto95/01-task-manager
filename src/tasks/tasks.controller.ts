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
      message: 'Task created successfully',
      data: task,
    };
  }

  @Get()
  async getAll(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    const [tasks, count] = await this.tasksService.getAll(userId);
    return {
      message: 'Tasks retrieved successfully',
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
      message: 'Deleted tasks retrieved successfully',
      meta: {
        itemsCount: count,
      },
      data: tasks,
    };
  }

  @Delete('purge') // Clearer name than 'emptying'
  @HttpCode(HttpStatus.OK)
  async purgeAllDeleted(@CurrentUser() user: { sub: string }) {
    const userId = user.sub;
    const result = await this.tasksService.deleteAllDeletedTasks(userId);
    return {
      message: 'All deleted tasks permanently removed',
      affected: result.affected,
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
      message: 'Task retrieved successfully',
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
      message: 'Task deleted successfully',
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
      message: 'Task updated successfully',
    };
  }

  @Patch(':taskId/restore') // RESTful sub-resource pattern
  @HttpCode(HttpStatus.OK)
  async restoreDeleted(
    @CurrentUser() user: { sub: string },
    @Param('taskId') taskId: string,
  ) {
    const userId = user.sub;
    await this.tasksService.restoreDeletedTask(userId, taskId);
    return {
      message: 'Task restored successfully',
    };
  }
}
