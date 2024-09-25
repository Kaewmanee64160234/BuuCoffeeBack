// permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  @Column()
  group: string;
  @Column()
  description: string;
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
