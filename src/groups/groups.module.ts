import { Module } from '@nestjs/common';
import { GroupService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPermission } from './entities/group.entity';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMember, Permission, GroupPermission, User]),
  ],

  controllers: [GroupsController],
  providers: [GroupService],
})
export class GroupsModule {}
