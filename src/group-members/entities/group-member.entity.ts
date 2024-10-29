// group-member.entity.ts
import { GroupPermission } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn()
  groupMemberId: number;

  @ManyToOne(() => GroupPermission, (group) => group.members, {
    onDelete: 'CASCADE',
  })
  group: GroupPermission;

  @ManyToOne(() => User, (user) => user.groupMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;
}
