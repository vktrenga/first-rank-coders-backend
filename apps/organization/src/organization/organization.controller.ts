import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard} from '@firstrankcoders/shared';
import { Organization, Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../guards/auth.guard';
import { Permission } from 'src/decorator/permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async create(@Body() createDto: CreateOrganizationDto): Promise<Organization> {
    return this.organizationService.create({ organizationDto: createDto });
  }

  @ApiBearerAuth() 
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('org:view') 
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string): Promise<Organization> {
    const { user } = req;
    if (user.organizationId) {
      id = user.organizationId;
    }
    const organization = await this.organizationService.findOne(id);
    if (organization === undefined) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return organization;
  }

  @ApiBearerAuth() 
  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('org:list') 
  async findAll(@Req() req: any): Promise<Organization[]> {
    const { user } = req;
    const organizations = await this.organizationService.findAll(user);
    return organizations;
  }

  @Put(':id')
  @Permission('org:update')
  async update(@Param('id') id: string, @Body() updateDto: any): Promise<Organization> {
    const updated = await this.organizationService.update(id, updateDto);
    if (updated == null) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return updated;
  }

  // @Delete(':id')
  // // @Roles(AuthRole.ADMIN)
  // async remove(@Param('id') id: string): Promise<BaseResponse> {
  //   const removed = await this.organizationService.remove(id);
  //   return BaseResponse.success({ message: `Organization with id ${id} removed` });
  // }
}
