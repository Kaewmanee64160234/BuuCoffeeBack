import { Injectable } from '@nestjs/common';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMember } from './entities/group-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupMembersService {
  constructor(
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}
  async findPermissionsByUserId(userId: number): Promise<string[]> {
    const groupMembers = await this.groupMemberRepository.find({
      where: { user: { userId: userId } },
      relations: ['group', 'group.permissions'],
    });

    // Extract permission names from group memberships
    const permissions = groupMembers.flatMap((member) =>
      member.group.permissions.map((permission) => permission.name),
    );

    return permissions;
  }
  create(createGroupMemberDto: CreateGroupMemberDto) {
    return 'This action adds a new groupMember';
  }

  async findAll() {
    try {
      const groupMembers = await this.groupMemberRepository.find({
        relations: ['user', 'group', 'group.permissions'],
      });
      return groupMembers;
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} groupMember`;
  }
  // find by userId
  async findByUserId(userId: number) {
    try {
      const groupMembers = await this.groupMemberRepository.find({
        where: { user: { userId: userId } },
        relations: ['user', 'group', 'group.permissions'],
      });
      return groupMembers;
    } catch (error) {
      console.log(error);
    }
  }

  update(id: number, updateGroupMemberDto: UpdateGroupMemberDto) {
    return `This action updates a #${id} groupMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupMember`;
  }
}
