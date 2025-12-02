import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  Matches,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Name of the organization', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({ example: 'ACME', description: 'Unique code for the organization', minLength: 2, maxLength: 20 })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'Code can only contain letters, numbers, underscores, and hyphens.' })
  code?: string;

  // Admin user credentials for future user creation/auth
  @ApiProperty({ example: 'admin@acme.com', description: 'Admin user email for organization', maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  adminUserEmail: string;

  @ApiProperty({ example: 'Password123', description: 'Admin user password', minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  @Matches(/(?=.*[A-Za-z])(?=.*\d).*$/, { message: 'Password must include at least one letter and one number.' })
  password: string;

  @ApiPropertyOptional({ example: 'info@acme.com', description: 'Contact email for organization', maxLength: 100 })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Contact phone number', minLength: 7, maxLength: 20 })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\- ]{7,20}$/, { message: 'Phone must be a valid number.' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://acme.com', description: 'Organization website', maxLength: 200 })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL.' })
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Organization address', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'City', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ example: 'NY', description: 'State', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Country', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ example: '10001', description: 'Pincode', minLength: 4, maxLength: 10 })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{4,10}$/, { message: 'Pincode must be numeric.' })
  pincode?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png', description: 'Logo URL', maxLength: 200 })
  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL.' })
  @MaxLength(200)
  logoUrl?: string; // Image upload option for organization logo

  @ApiPropertyOptional({ example: 'https://acme.com/cover.png', description: 'Cover image URL', maxLength: 200 })
  @IsOptional()
  @IsUrl({}, { message: 'Cover Image URL must be a valid URL.' })
  @MaxLength(200)
  coverImageUrl?: string; // Image upload option for organization cover image
}