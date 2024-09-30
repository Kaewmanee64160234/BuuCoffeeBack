// role.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Create a new role with permissions
  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async createRole(@Body() body: { role: string; permissions: string[] }) {
    console.log(body.role);

    return this.roleService.createRole(body.role, body.permissions);
  }

  // Assign permissions to an existing role
  @Patch('/:roleId/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async assignPermissions(
    @Param('roleId') roleId: number,
    @Body() body: { permissions: CreatePermissionDto[] },
  ) {
    return this.roleService.assignPermissionsToRole(roleId, body.permissions);
  }

  // Get all roles
  @Get('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  // Get a specific role by ID
  @Get('/:roleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async getRole(@Param('roleId') roleId: number) {
    return this.roleService.getRole(roleId);
  }
}
