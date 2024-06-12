import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
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

  @Column()
  paymentMethod: string;

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.reciept, {
    cascade: true,
  })
  receiptItems: ReceiptItem[];
  @ManyToOne(() => User, (user) => user.reciepts)
  user: User;
  @ManyToOne(() => Customer, (customer) => customer.reciept)
  customer: Customer;
  @OneToMany(
    () => ReceiptPromotion,
    (receiptPromotion) => receiptPromotion.receipt,
  )
  receiptPromotions: ReceiptPromotion[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
