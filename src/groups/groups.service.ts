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
      console.log('UserIds:', createGroupDto.userIds);

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
  // get all groups
  async findAll() {
    return await this.groupRepository.find({
      relations: ['permissions', 'members', 'permissions', 'members.user'],
    });
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

    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
      relations: ['permissions', 'members'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Delete all group members and permissions manually
    await this.groupMemberRepository.delete({ group: group });
    await this.permissionRepository
      .createQueryBuilder()
      .relation(GroupPermission, 'permissions')
      .of(groupId)
      .remove(group.permissions);

    // Finally, delete the group
    await this.groupRepository.delete({ groupId: groupId });

    return group;
  }
  // update group
  async updateGroup(groupId: number, createGroupDto: CreateGroupDto) {
    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
      relations: ['permissions', 'members', 'members.user'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Update group name
    group.name = createGroupDto.name;

    // Update permissions
    if (createGroupDto.permissionIds) {
      // Find existing permission IDs
      const currentPermissionIds = group.permissions.map((p) => p.id);

      // Determine permissions to add
      const newPermissions = createGroupDto.permissionIds.filter(
        (id) => !currentPermissionIds.includes(id),
      );

      // Determine permissions to remove
      const permissionsToRemove = currentPermissionIds.filter(
        (id) => !createGroupDto.permissionIds.includes(id),
      );

      // Add new permissions
      for (const permissionId of newPermissions) {
        const permission = await this.permissionRepository.findOne({
          where: { id: permissionId },
        });
        if (permission) {
          group.permissions.push(permission);
        }
      }

      // Remove old permissions
      if (permissionsToRemove.length > 0) {
        group.permissions = group.permissions.filter(
          (permission) => !permissionsToRemove.includes(permission.id),
        );
      }
    }

    // Update members
    if (createGroupDto.userIds) {
      // Find existing user IDs
      const currentUserIds = group.members.map((member) => member.user.userId);

      // Determine users to add
      const newUserIds = createGroupDto.userIds.filter(
        (id) => !currentUserIds.includes(id),
      );

      // Determine users to remove
      const usersToRemove = currentUserIds.filter(
        (id) => !createGroupDto.userIds.includes(id),
      );

      // Add new members
      for (const userId of newUserIds) {
        const user = await this.userRepository.findOne({
          where: { userId: userId },
        });

        if (user) {
          const groupMember = this.groupMemberRepository.create({
            group: group,
            user: user,
          });
          await this.groupMemberRepository.save(groupMember);
          group.members.push(groupMember);
        }
      }

      // Remove old members
      if (usersToRemove.length > 0) {
        for (const userId of usersToRemove) {
          await this.groupMemberRepository.delete({
            group: group,
            user: { userId: userId },
          });
        }
        group.members = group.members.filter(
          (member) => !usersToRemove.includes(member.user.userId),
        );
      }
    }

    return await this.groupRepository.save(group);
  }
}
