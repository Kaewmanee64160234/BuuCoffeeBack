import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Cashier {
  @PrimaryGeneratedColumn()
  cashierId: number;
  @Column({ type: 'float' })
  cashierAmount: number;
  @Column({ type: 'datetime' })
  createdDate: Date;
  @Column({ type: 'datetime', nullable: true })
  deleteDate?: Date;
  @ManyToOne(() => User, (user) => user.cashiers)
  @JoinColumn({ name: 'userId' })
  user: User;
}
