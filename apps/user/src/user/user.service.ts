import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BaseResponse,
  AppException,
  NotFoundException,
  PrismaExceptionMapper,
  PrismaService,
} from '@firstrankcoders/shared';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    try {
      const createData: any = { ...data };
      if (data.organizationId) {
        
        const org = await this.prisma.organization.findUnique({
          where: { id: data.organizationId },
        });

        if (!org) {
          throw new BadRequestException('Organization does not exist yet.');
        }
        createData.organizationId = org.id;
      }

      const user = await this.prisma.user.create({ data: createData });
      return BaseResponse.success(user, 'User created successfully');
    } catch (error) {
      console.log('error', error);
      const mapped = PrismaExceptionMapper.map(error);
      if (mapped) throw mapped;
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { organization: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    // return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
