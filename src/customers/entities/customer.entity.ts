import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
}
