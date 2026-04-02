import { Transform } from 'class-transformer';
import { IsString, Length, MinLength } from 'class-validator';

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
export class CreateTaskDto {}
export class UpdateTaskDto {}
