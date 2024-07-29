import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
@Entity()
export class Exportingredient {
  @PrimaryGeneratedColumn()
  exportID: number;
  @Column({ type: 'datetime' })
  exportDate: Date;
  @Column({ nullable: true })
  exportDescription: string;
  @ManyToOne(() => User, (user) => user.exportingredients)
  @JoinColumn({ name: 'userId' })
  user: User;
}
