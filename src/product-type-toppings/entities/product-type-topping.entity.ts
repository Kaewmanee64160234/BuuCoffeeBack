import { ProductType } from 'src/product-types/entities/product-type.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductTypeTopping {
  @PrimaryGeneratedColumn()
  productTypeToppingId: number;

  @Column({ type: 'numeric' })
  quantity: number;

  @ManyToOne(
    () => ProductType,
    (productType) => productType.productTypeToppings,
  )
  productType: ProductType;

  @ManyToOne(() => Topping, (topping) => topping.productTypeToppings)
  topping: Topping;

  @ManyToOne(
    () => ReceiptItem,
    (receiptItem) => receiptItem.productTypeToppings,
  )
  receiptItem: ReceiptItem;
}
