// permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { GroupPermission } from 'src/groups/entities/group.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // E.g., "canSell", "canEditTopping", "canCreateTopping"

  @Column({ nullable: true })
  description: string; // Description of what the permission does

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
  // group
  @ManyToOne(() => GroupPermission, (group) => group.permissions)
  group: GroupPermission;
}
