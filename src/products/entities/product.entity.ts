import { Category } from 'src/categories/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column({ unique: true })
  productName: string;

  @Column({ type: 'float' })
  productPrice: number;

  @Column({ default: 'no-image.jpg', nullable: true })
  productImage: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @OneToMany(() => ProductType, (productType) => productType.product)
  productTypes: ProductType[];

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.product)
  receiptItems: ReceiptItem[];
}
