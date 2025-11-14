import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address to reset password' })
  email: string;
}
