import { Module } from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPermission } from 'src/groups/entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupPermission, GroupMember, User, Permission]),
  ],
  controllers: [GroupMembersController],
  providers: [GroupMembersService],
})
export class GroupMembersModule {}
