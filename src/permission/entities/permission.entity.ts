// permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { GroupPermission } from 'src/groups/entities/group.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  permissionId: number;

  @Column({ unique: true })
  name: string; // e.g., "canSell", "canEditTopping", "canCreateTopping"

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => GroupPermission, (group) => group.permissions)
  group: GroupPermission;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
