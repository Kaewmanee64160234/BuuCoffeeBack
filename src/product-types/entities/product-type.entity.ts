import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Product } from 'src/products/entities/product.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
@Entity()
export class ProductType {
  static productTypePrice(productTypePrice: any) {
    throw new Error('Method not implemented.');
  }
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

  @OneToMany(() => Recipe, (recipe) => recipe.productType, { cascade: true })
  recipes: Recipe[];
}
