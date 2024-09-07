import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
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
export class ProductType {
  @PrimaryGeneratedColumn()
  productTypeId: number;

  @Column()
  productTypeName: string;

  @Column({ type: 'numeric' })
  productTypePrice: number;

  @OneToMany(
    () => ProductTypeTopping,
    (productTypeTopping) => productTypeTopping.productType,
    { cascade: true },
  )
  productTypeToppings: ProductTypeTopping[];

  @ManyToOne(() => Product, (product) => product.productTypes, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => Recipe, (recipe) => recipe.productType, {
    cascade: true,
    nullable: true,
  })
  recipes: Recipe[];

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.productType, {
    cascade: true,
  })
  receiptItems: ReceiptItem[];
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
