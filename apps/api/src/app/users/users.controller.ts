import { Controller, Get, Param, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/auth';
import { PermissionAction, PermissionResource, CreateUserDto } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.USER })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.USER })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.CREATE, resource: PermissionResource.USER })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.DELETE, resource: PermissionResource.USER })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
