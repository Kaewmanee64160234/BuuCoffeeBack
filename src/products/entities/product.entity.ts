import { Category } from 'src/categories/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column()
  productName: string;

  @Column({ type: 'float' })
  productPrice: number;

  @Column({ default: 'no-image.jpg', nullable: true })
  productImage: string;

  @Column()
  storeType: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @OneToMany(() => ProductType, (productType) => productType.product)
  productTypes: ProductType[];

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.product)
  receiptItems: ReceiptItem[];

  @Column({ default: false })
  countingPoint: boolean;

  @Column({ default: false, unique: true })
  barcode: string;

  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
