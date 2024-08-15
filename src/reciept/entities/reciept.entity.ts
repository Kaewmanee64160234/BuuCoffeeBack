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
  OneToOne,
} from 'typeorm';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
@Entity()
export class Reciept {
  @PrimaryGeneratedColumn()
  receiptId: number;
  @Column({ nullable: true })
  receiptNumber: number;
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
  queueNumber: number;

  @Column()
  paymentMethod: string;

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.reciept, {
    cascade: true,
  })
  receiptItems: ReceiptItem[];

  @Column()
  receive: number;
  @Column()
  change: number;

  // onr to one  to checkstovk==ck id can null'
  @Column()
  checkIngredientId: number;

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
