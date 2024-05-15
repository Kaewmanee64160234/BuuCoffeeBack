import { Reciept } from 'src/reciept/entities/reciept.entity';
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class ReceiptPromotion {
  @PrimaryGeneratedColumn()
  receiptPromoId: number;
  @Column()
  receiptDiscount: number;
  @Column()
  receiptDate: number;
  // @ManyToOne(() => Reciept, (receipt) => receipt.receiptPromotion)
  // receipt: Reciept;
}
