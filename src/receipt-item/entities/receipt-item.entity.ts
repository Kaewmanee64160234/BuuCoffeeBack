import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
@Entity()
export class ReceiptItem {
  @PrimaryGeneratedColumn()
  receiptItemId: number;
  @Column()
  receiptSubTotal: number;
  @ManyToOne(() => Reciept, (reciept) => reciept.receiptItems)
  reciept: Reciept;

  @OneToMany(
    () => ProductTypeTopping,
    (productTypeTopping) => productTypeTopping.receiptItem,
    { cascade: true },
  )
  productTypeToppings: ProductTypeTopping[];
}
