import { Customer } from 'src/customers/entities/customer.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { User } from 'src/users/entities/user.entity';
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
  @Column({ type: 'numeric' })
  quantity: number;
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
  @Column({ nullable: true })
  sweetnessLevel: string;

  @ManyToOne(() => Product, (product) => product.receiptItems)
  product: Product;

  @ManyToOne(() => ProductType, (productType) => productType.receiptItems)
  productType: ProductType;
}
