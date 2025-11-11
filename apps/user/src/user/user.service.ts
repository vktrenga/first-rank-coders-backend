import { Injectable } from '@nestjs/common';
import { PrismaExceptionMapper, PrismaService } from '@firstrankcoders/shared';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { BaseResponse, AppException, NotFoundException } from '@firstrankcoders/shared';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
      try {
        const user = await this.prisma.user.create({ data });
        return BaseResponse.success(user, 'User created successfully');

      } catch (error) {
          const mapped = PrismaExceptionMapper.map(error);
          if (mapped) throw mapped;
          throw error;
      }
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { organization: true, adminOfOrg: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { organization: true, adminOfOrg: true },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
