import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Reciept {
  @PrimaryGeneratedColumn()
  receiptId: number;
  @Column()
  receiptTotalPrice: number;
  @Column()
  receiptTotalDiscount: number;
  @Column()
  receiptNetPrice: number;
  @Column()
  receiptStatus: string;
  @Column()
  receiptType: string;
  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.reciept, {
    cascade: true,
  })
  receiptItems: ReceiptItem[];
  @ManyToOne(() => User, (user) => user.reciepts)
  user: User;
  @ManyToOne(() => Customer, (customer) => customer.reciept)
  customer: Customer;
}
