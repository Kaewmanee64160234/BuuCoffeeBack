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
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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
    { onDelete: 'CASCADE' },
  )
  receiptItem: ReceiptItem;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
