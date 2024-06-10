import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
@Entity()
export class Cashier {
  @PrimaryGeneratedColumn()
  cashierId: number;
  @Column({ type: 'float' })
  cashierAmount: number;
  @Column({ type: 'datetime' })
  createdDate: Date;
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;
  @ManyToOne(() => User, (user) => user.cashiers)
  @JoinColumn({ name: 'userId' })
  user: User;
}
