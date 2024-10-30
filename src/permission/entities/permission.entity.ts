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
  id: number;

  @Column({ unique: true })
  name: string; // Name of the permission (e.g., "canSell", "canEditTopping")

  @Column({ nullable: true })
  description: string; // Description of what the permission does

  @ManyToMany(() => GroupPermission, (group) => group.permissions)
  groups: GroupPermission[];
}
