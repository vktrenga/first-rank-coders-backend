import { Prisma, Role } from '@prisma/client';
import { IsString, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';

// export class CreateUserDto  implements Prisma.UserCreateInput {
//   name: string;
//   email: string;
//   password: string;
//   role: Role;
//   organizationId?: string;
//   departmentId?: string;
//   classId?: string;
// }
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}