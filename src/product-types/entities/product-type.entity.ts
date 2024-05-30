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
  @PrimaryGeneratedColumn()
  productTypeId: number;

  @Column()
  productTypeName: string;

  @Column({ type: 'numeric' })
  productTypePrice: number;

  @ManyToOne(() => Product, (product) => product.productTypes)
  product: Product;

  @OneToMany(
    () => ProductTypeTopping,
    (productTypeTopping) => productTypeTopping.productType,
    { cascade: true },
  )
  productTypeToppings: ProductTypeTopping[];

  @OneToMany(() => Recipe, (recipe) => recipe.productType) // Change this line
  recipes: Recipe[]; // Change this line
}
