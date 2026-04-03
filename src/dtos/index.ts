import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, MinLength } from 'class-validator';

function Normalize() {
  return Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}
export class CreateUserDto {
  @Normalize()
  @IsString()
  @Length(2, 55)
  username: string;
  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUserDto {
  @Normalize()
  @IsString()
  @Length(2, 55)
  username: string;
}

export class CreateTaskDto {
  @Normalize()
  @IsString()
  @Length(2, 55)
  title: string;
  @Normalize()
  @IsString()
  @Length(2, 1024)
  @IsOptional()
  description?: string;
}
export class UpdateTaskDto {
  @Normalize()
  @IsString()
  @Length(2, 55)
  @IsOptional()
  title?: string;
  @Normalize()
  @IsString()
  @Length(2, 1024)
  @IsOptional()
  description?: string;
}
