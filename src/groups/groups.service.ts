// group.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { GroupPermission } from './entities/group.entity';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { User } from 'src/users/entities/user.entity';

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

  async createGroup(name: string): Promise<GroupPermission> {
    const group = this.groupRepository.create({ name });
    return await this.groupRepository.save(group);
  }

  async addMemberToGroup(
    groupId: number,
    userId: number,
  ): Promise<GroupMember> {
    const group = await this.groupRepository.findOne({
      where: { groupId: groupId },
    });
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });

    const groupMember = this.groupMemberRepository.create({ group, user });
    return await this.groupMemberRepository.save(groupMember);
  }

  async assignPermissionsToGroup(
    groupId: number,
    permissionIds: number[],
  ): Promise<GroupPermission> {
    const group = await this.groupRepository.findOne({
      where: { groupId },
      relations: ['permissions'],
    });

    const permissions = await this.permissionRepository.findByIds(
      permissionIds,
    );
    group.permissions = permissions;

    return await this.groupRepository.save(group);
  }
}
