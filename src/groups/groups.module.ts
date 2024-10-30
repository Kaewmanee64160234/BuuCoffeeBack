import { Module } from '@nestjs/common';
import { GroupService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPermission } from './entities/group.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, GroupPermission, User])],

  controllers: [GroupsController],
  providers: [GroupService],
})
export class GroupsModule {}
