// group.controller.ts
import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { GroupService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(@Body('name') name: string) {
    return await this.groupService.createGroup(name);
  }

  @Put(':groupId/members/:userId')
  async addMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    return await this.groupService.addMemberToGroup(groupId, userId);
  }

  @Put(':groupId/permissions')
  async assignPermissions(
    @Param('groupId') groupId: number,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return await this.groupService.assignPermissionsToGroup(
      groupId,
      permissionIds,
    );
  }
}
