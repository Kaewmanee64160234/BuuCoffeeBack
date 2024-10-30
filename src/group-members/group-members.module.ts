// group-members.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { GroupMember } from './entities/group-member.entity';
import { GroupPermission } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMember, GroupPermission, User, Permission]),
  ],
  providers: [GroupMembersService], // Provide GroupMembersService here
  controllers: [GroupMembersController],
  exports: [GroupMembersService], // Export GroupMembersService to make it accessible in other modules
})
export class GroupMembersModule {}
