// group.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { GroupService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupService: GroupService) {}
  // findAll
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async findAll() {
    return await this.groupService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    console.log(createGroupDto);

    return await this.groupService.createGroup(createGroupDto);
  }
  // pach
  @Patch(':groupId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async updateGroup(
    @Param('groupId') groupId: number,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return await this.groupService.updateGroup(groupId, createGroupDto);
  }

  @Patch(':groupId/users')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async addUsersToGroup(
    @Param('groupId') groupId: number,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return await this.groupService.addUsersToGroup(
      groupId,
      createGroupDto.userIds,
    );
  }

  // @Patch(':groupId/members/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  // async addMember(
  //   @Param('groupId') groupId: number,
  //   @Param('userId') userId: number,
  // ) {
  //   return await this.groupService.addUserToGroup(groupId, userId);
  // }
  @Patch(':groupId/permissions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async assignPermissions(
    @Param('groupId') groupId: number,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return await this.groupService.assignPermissionsToGroup(
      groupId,
      createGroupDto.permissionIds,
    );
  }
  // deleteGroup
  @Delete(':groupId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสิทธิ์เข้าถึง')
  async deleteGroup(@Param('groupId') groupId: number) {
    return await this.groupService.deleteGroup(groupId);
  }
}
