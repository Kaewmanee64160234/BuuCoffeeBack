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
  OneToMany,
} from 'typeorm';
import { CashierItem } from './cashierItem.entity';

@Entity()
export class Cashier {
  @PrimaryGeneratedColumn()
  cashierId: number;

  @Column({ type: 'float' })
  cashierAmount: number;
  @CreateDateColumn({ type: 'datetime' })
  createdDate: Date;

  @ManyToOne(() => User, (user) => user.openedCashiers, { nullable: true })
  @JoinColumn({ name: 'openedByUserId' })
  openedBy: User;

  @Column({ type: 'datetime', nullable: true })
  closedDate: Date;

  @Column({ type: 'float', nullable: true })
  closedAmount: number;

  @ManyToOne(() => User, (user) => user.closedCashiers, { nullable: true })
  @JoinColumn({ name: 'closedByUserId' })
  closedBy: User;
  @OneToMany(() => CashierItem, (cashierItem) => cashierItem.cashier)
  cashierItems: CashierItem[];
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;
}
