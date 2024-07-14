import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class Cashier {
  @PrimaryGeneratedColumn()
  cashierId: number;
  @Column({ type: 'float' })
  cashierAmount: number;
  @CreateDateColumn({ type: 'datetime' })
  createdDate: Date;
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;
  @ManyToOne(() => User, (user) => user.cashiers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
