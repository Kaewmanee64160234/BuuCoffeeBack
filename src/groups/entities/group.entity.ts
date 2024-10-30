// group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Entity('groups')
export class GroupPermission {
  @PrimaryGeneratedColumn()
  groupId: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.groups)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.groups)
  @JoinTable() // Include this to create the join table between GroupPermission and Permission
  permissions: Permission[];
}
