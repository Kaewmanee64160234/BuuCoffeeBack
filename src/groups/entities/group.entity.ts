// group.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { GroupMember } from 'src/group-members/entities/group-member.entity';

@Entity('groups')
export class GroupPermission {
  @PrimaryGeneratedColumn()
  groupId: number;

  @Column({ length: 64 })
  name: string; // Name of the group, e.g., "Barista Team"

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group)
  members: GroupMember[];

  @OneToMany(() => Permission, (permission) => permission.group)
  permissions: Permission[]; // Permissions granted to the group
}
