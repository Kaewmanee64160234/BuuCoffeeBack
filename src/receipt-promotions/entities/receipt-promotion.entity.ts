import { Promotion } from 'src/promotions/entities/promotion.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class ReceiptPromotion {
  @PrimaryGeneratedColumn()
  receiptPromId: number;

  @ManyToOne(() => Reciept, (reciept) => reciept.receiptPromotions)
  receipt: Reciept;

  @ManyToOne(() => Promotion, (promotion) => promotion.receiptPromotions)
  promotion: Promotion;

  @Column('decimal')
  discount: number;

  @Column('date')
  date: Date;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
