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

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupService: GroupService) {}
  // findAll
  @Get()
  async findAll() {
    return await this.groupService.findAll();
  }

  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupService.createGroup(createGroupDto);
  }

  @Patch(':groupId/users')
  async addUsersToGroup(
    @Param('groupId') groupId: number,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return await this.groupService.addUsersToGroup(
      groupId,
      createGroupDto.userIds,
    );
  }

  @Patch(':groupId/members/:userId')
  async addMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    return await this.groupService.addUserToGroup(groupId, userId);
  }

  @Patch(':groupId/permissions')
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
  async deleteGroup(@Param('groupId') groupId: number) {
    return await this.groupService.deleteGroup(groupId);
  }
}
