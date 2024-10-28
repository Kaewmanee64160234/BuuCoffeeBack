import { Cashier } from 'src/cashiers/entities/cashier.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CashierItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['1000', '500', '100', '50', '20', '10', '5', '2', '1'],
  })
  denomination: string; // ประเภทของธนบัตรหรือเหรียญ

  @Column({ type: 'int' })
  quantity: number; // จำนวน
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
  @ManyToOne(() => Cashier, (cashier) => cashier.cashierItems, {
    nullable: false,
  })
  cashier: Cashier; // ความสัมพันธ์กับ Cashier
}
