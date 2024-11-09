import { Category } from 'src/categories/entities/category.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { MealProduct } from 'src/meal-products/entities/meal-product.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column({ default: false })
  needLinkIngredient: boolean;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @OneToMany(() => ProductType, (productType) => productType.product)
  productTypes: ProductType[];

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.product)
  receiptItems: ReceiptItem[];

  @Column({ default: false })
  countingPoint: boolean;

  @Column({ default: false })
  barcode: string;

  @Column({ default: false })
  haveTopping: boolean;
  @OneToMany(() => MealProduct, (mealProduct) => mealProduct.product)
  mealProducts: MealProduct[];

  @OneToOne(() => Ingredient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  ingredient: Ingredient | null;

  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
