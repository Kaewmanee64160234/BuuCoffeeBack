// group.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { GroupPermission } from './entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupPermission)
    private groupRepository: Repository<GroupPermission>,
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

      // Create new group instance and initialize permissions and users as empty arrays
      const newGroup = this.groupRepository.create({
        name: createGroupDto.name,
        permissions: [],
        users: [],
      });

      // Save the new group to the database first to get its ID
      await this.groupRepository.save(newGroup);

      // If there are permission IDs, fetch and add permissions in bulk
      if (
        createGroupDto.permissionIds &&
        createGroupDto.permissionIds.length > 0
      ) {
        for (const permissionId of createGroupDto.permissionIds) {
          const permission = await this.permissionRepository.findOne({
            where: { id: permissionId },
          });
          if (permission) {
            newGroup.permissions.push(permission);
          }
        }
      }

      // If there are user IDs, fetch and add users in bulk
      if (createGroupDto.userIds && createGroupDto.userIds.length > 0) {
        for (const userId of createGroupDto.userIds) {
          const user = await this.userRepository.findOne({ where: { userId } });
          if (user) {
            newGroup.users.push(user);
          }
        }
      }

      // Save the group with permissions and users
      return await this.groupRepository.save(newGroup);
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create group');
    }
  }

  // get all groups
  async findAll() {
    return await this.groupRepository.find({
      relations: ['permissions', 'users'],
      order: { groupId: 'ASC' },
    });
  }

  async addUsersToGroup(
    groupId: number,
    userIds: number[],
  ): Promise<GroupPermission> {
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['users'],
    });
    if (!group) throw new Error('Group not found');

    for (const userId of userIds) {
      const user = await this.userRepository.findOne({ where: { userId } });
      if (user && !group.users.some((u) => u.userId === userId)) {
        group.users.push(user);
      }
    }
    return await this.groupRepository.save(group);
  }
  async removeUserFromGroup(
    groupId: number,
    userId: number,
  ): Promise<GroupPermission> {
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['users'],
    });
    if (!group) throw new Error('Group not found');

    group.users = group.users.filter((user) => user.userId !== userId);
    return await this.groupRepository.save(group);
  }
  async getGroupWithUsers(groupId: number): Promise<GroupPermission> {
    return await this.groupRepository.findOne({
      where: { groupId },
      relations: ['users'],
    });
  }

  // async addUserToGroup(groupId: number, userId: number): Promise<GroupMember> {
  //   const group = await this.groupRepository.findOne({
  //     where: { groupId: groupId },
  //   });
  //   const user = await this.userRepository.findOne({
  //     where: { userId: userId },
  //   });

  //   if (!group || !user) {
  //     throw new Error('Group or User not found');
  //   }

  //   const groupMember = this.groupMemberRepository.create({ group, user });
  //   return await this.groupMemberRepository.save(groupMember);
  // }

  async assignPermissionsToGroup(
    groupId: number,
    permissionIds: number[],
  ): Promise<GroupPermission> {
    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
      relations: ['permissions'],
    });

    if (!group) {
      throw new Error('Group not found');
    }
    // loop permission to add permisstion
    for (const permissionId of permissionIds) {
      const permission = await this.permissionRepository.findOne({
        where: { id: permissionId },
      });
      console.log('Added permission:', permissionId);

      if (permission) {
        group.permissions.push(permission);
      }
    }
    // save group
    return await this.groupRepository.save(group);
  }
  // delete deleteGroup delete all data that relate
  async deleteGroup(groupId: number) {
    console.log('Deleting group:', groupId);

    // Find the group with its permissions and users
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['permissions', 'users'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Remove all associated permissions and users
    group.permissions = [];
    group.users = [];
    await this.groupRepository.save(group); // Save the cleared relationships

    // Finally, delete the group
    await this.groupRepository.delete({ groupId });

    return group;
  }

  // update group
  async updateGroup(groupId: number, createGroupDto: CreateGroupDto) {
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['permissions', 'users'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Update group name
    group.name = createGroupDto.name;

    // Update permissions
    if (createGroupDto.permissionIds) {
      // Fetch permissions by IDs from the database
      const newPermissions = await this.permissionRepository.findByIds(
        createGroupDto.permissionIds,
      );

      // Replace old permissions with the new ones
      group.permissions = newPermissions;
    }

    // Update users
    if (createGroupDto.userIds) {
      // Fetch users by IDs from the database
      const newUsers = await this.userRepository.findByIds(
        createGroupDto.userIds,
      );

      // Replace old users with the new ones
      group.users = newUsers;
    }

    // Save updated group
    return await this.groupRepository.save(group);
  }
}
