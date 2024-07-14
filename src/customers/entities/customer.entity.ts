import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reciept } from 'src/reciept/entities/reciept.entity';
@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  customerId: number;
  @Column()
  customerName: string;
  @Column()
  customerNumberOfStamp: number;
  @Column()
  customerPhone: string;
  customer: any;
  receipt: any;

  @OneToMany(() => Reciept, (reciept) => reciept.user)
  reciept: Reciept[];
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
