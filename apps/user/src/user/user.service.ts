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
        
        // transform DTO to Prisma create input: if organizationId is provided,
        // use nested connect syntax and remove organizationId from raw payload
        const createData: any = { ...data };
        const relationFields = ['organizationId', 'departmentId', 'classId'];
        const relationMap: Record<string, string> = {
          organizationId: 'organization',
          departmentId: 'department',
          classId: 'class',
        };

        relationFields.forEach(field => {
          if (data[field as keyof typeof data]) {
            const relationKey = relationMap[field];
            createData[relationKey] = { connect: { id: data[field as keyof typeof data] } };
            delete createData[field];
          }
        });

        const user = await this.prisma.user.create({ data: createData });
        return BaseResponse.success(user, 'User created successfully');

      } catch (error) {
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
      include: { organization: true},
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
