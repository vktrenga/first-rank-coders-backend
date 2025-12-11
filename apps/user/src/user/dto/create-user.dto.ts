import { Role } from '@prisma/client';
import { IsString, IsEmail,  IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role must be a valid Role enum value' })
  role: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  authUserId?: string;
}