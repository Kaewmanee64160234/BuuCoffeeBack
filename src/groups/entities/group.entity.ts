// group.entity.ts
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('groups')
export class GroupPermission {
  @PrimaryGeneratedColumn()
  groupId: number;

  @Column()
  name: string; // Name of the group (e.g., "Product Manager", "Cashier")

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  permissions: Permission[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  members: GroupMember[];
}
