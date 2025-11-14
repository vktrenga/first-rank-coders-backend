import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'user-uuid', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'OldPassword123', description: 'Current password' })
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword456', description: 'New password' })
  newPassword: string;
}
