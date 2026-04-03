import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UpdateUserDto } from 'src/dtos';
import type { Response, Request } from 'express';
import { JwtGuard, LocalGuard } from './guards';
import { CurrentUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.register(dto, res);
    return {
      message: 'user registered successfully',
      accessToken,
    };
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = await this.authService.login(req, res);
    return {
      message: 'user logged in successfully',
      accessToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.logout(res);
    return {
      message: 'user logged out successfully',
    };
  }

  @Delete()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: { sub: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = user.sub;
    await this.authService.delete(userId);
    this.authService.logout(res);
    return { message: 'user deleted successfully' };
  }

  @Patch()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateUserDto,
  ) {
    const userId = user.sub;
    await this.authService.update(userId, dto);
    return { message: 'user updated successfully' };
  }
}
