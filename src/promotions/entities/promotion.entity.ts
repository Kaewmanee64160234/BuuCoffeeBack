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

  @Column('decimal', { nullable: true })
  discountValue: number;

  @Column('int', { nullable: true })
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

  @Column()
  promotionForStore: string;

  @Column('date', { nullable: true })
  endDate: Date;

  @Column({ default: false })
  noEndDate: boolean;

  @OneToMany(
    () => ReceiptPromotion,
    (receiptPromotion) => receiptPromotion.promotion,
  )
  receiptPromotions: ReceiptPromotion[];
}
