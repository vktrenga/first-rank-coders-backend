import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { BaseResponse, AuthRole, Roles, JwtAuthGuard, } from '@firstrankcoders/shared';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('organization')
// @UseGuards(RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async create(@Body() createDto: CreateOrganizationDto): Promise<BaseResponse> {
    return this.organizationService.create({ organizationDto: createDto });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles(Role.ORG_ADMIN, Role.ADMIN)
  async findOne(@Param('id') id: string): Promise<BaseResponse> {
    const organization = await this.organizationService.findOne(id);
    if (organization === undefined) {
      return BaseResponse.error(`Organization with id ${id} not found`);
    }
    return BaseResponse.success(organization);
  }

  // @Roles(AuthRole.ADMIN, AuthRole.USER, AuthRole.STAFF)
  @ApiBearerAuth() // Add this above your controller class
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN_STAFF, Role.SUPER_ADMIN, Role.ORG_MANAGEMENT, Role.ORG_STAFF)
  @Get()
  async findAll(@Req() req: any): Promise<BaseResponse> {
    const user = req.user;
    const organizations = await this.organizationService.findAll(user);
    return BaseResponse.success(organizations);
  }

  // @Put(':id')
  // // @Roles(AuthRole.ADMIN)
  // async update(@Param('id') id: string, @Body() updateDto: any): Promise<BaseResponse> {
  //   const updated = await this.organizationService.update(id, updateDto);
  //   if (updated == null) {
  //     return BaseResponse.error(`Organization with id ${id} not found`);
  //   }
  //   return BaseResponse.success(updated);
  // }

  // @Delete(':id')
  // // @Roles(AuthRole.ADMIN)
  // async remove(@Param('id') id: string): Promise<BaseResponse> {
  //   const removed = await this.organizationService.remove(id);
  //   return BaseResponse.success({ message: `Organization with id ${id} removed` });
  // }
}
