import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  promotionId: number;

  @Column({ length: 255 })
  promotionName: string;

  @Column({ length: 255, nullable: true })
  promotionDescription: string;

  @Column({ length: 50 })
  promotionType: string;

  @Column('decimal')
  discountValue: number;

  @Column('int')
  conditionQuantity: number;

  @Column('int', { nullable: true })
  buyProductId: number;

  @Column('int', { nullable: true })
  freeProductId: number;

  @Column('decimal', { nullable: true })
  conditionValue1: number;

  @Column('decimal', { nullable: true })
  conditionValue2: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @OneToMany(
    () => ReceiptPromotion,
    (receiptPromotion) => receiptPromotion.promotion,
  )
  receiptPromotions: ReceiptPromotion[];
}
