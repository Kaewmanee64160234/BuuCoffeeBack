import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
}
