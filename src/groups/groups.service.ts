// group.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { GroupPermission } from './entities/group.entity';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupPermission)
    private groupRepository: Repository<GroupPermission>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto) {
    try {
      // Check if the group already exists
      const existingGroup = await this.groupRepository.findOne({
        where: { name: createGroupDto.name },
      });

      if (existingGroup) {
        throw new Error('Group already exists');
      }

      // Create new group instance
      const newGroup = this.groupRepository.create({
        name: createGroupDto.name,
      });

      // Save the new group to the database first to get its ID
      await this.groupRepository.save(newGroup);

      // If there are permission IDs, find and add the permissions
      if (
        createGroupDto.permissionIds &&
        createGroupDto.permissionIds.length > 0
      ) {
        newGroup.permissions = [];

        for (const permissionId of createGroupDto.permissionIds) {
          const permission = await this.permissionRepository.findOne({
            where: { id: permissionId },
          });
          if (permission) {
            newGroup.permissions.push(permission);
          }
        }

        // Update the group with its permissions
        await this.groupRepository.save(newGroup);
      }

      // If there are user IDs, find users and add them as group members
      if (createGroupDto.userIds && createGroupDto.userIds.length > 0) {
        newGroup.members = [];

        for (const userId of createGroupDto.userIds) {
          const user = await this.userRepository.findOne({
            where: { userId: userId },
          });

          if (user) {
            const groupMember = this.groupMemberRepository.create({
              group: newGroup,
              user: user,
            });
            await this.groupMemberRepository.save(groupMember);
            newGroup.members.push(groupMember);
          }
        }
      }

      // Return the final group with populated permissions and members
      return await this.groupRepository.findOne({
        where: { groupId: newGroup.groupId },
        relations: ['permissions', 'members'],
      });
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create group');
    }
  }

  async addUsersToGroup(
    groupId: number,
    userIds: number[],
  ): Promise<GroupMember[]> {
    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    const groupMembers = [];

    for (const userId of userIds) {
      const user = await this.userRepository.findOne({ where: { userId } });
      if (user) {
        const groupMember = this.groupMemberRepository.create({ group, user });
        groupMembers.push(await this.groupMemberRepository.save(groupMember));
      }
    }

    return groupMembers;
  }

  async addUserToGroup(groupId: number, userId: number): Promise<GroupMember> {
    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
    });
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });

    if (!group || !user) {
      throw new Error('Group or User not found');
    }

    const groupMember = this.groupMemberRepository.create({ group, user });
    return await this.groupMemberRepository.save(groupMember);
  }

  async assignPermissionsToGroup(
    groupId: number,
    permissionIds: number[],
  ): Promise<GroupPermission> {
    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
      relations: ['permissions'],
    });

    const permissions = await this.permissionRepository.findByIds(
      permissionIds,
    );
    group.permissions = permissions;

    return await this.groupRepository.save(group);
  }
  // get all groups
  async findAll() {
    return await this.groupRepository.find({
      relations: ['permissions', 'members'],
    });
  }
}
