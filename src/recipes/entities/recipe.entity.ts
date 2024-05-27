import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  recipeId: number;

  @Column()
  productId: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipes)
  ingredient: Ingredient;

  @Column()
  quantity: number;

  @OneToOne(() => ProductType, (productType) => productType.recipe)
  productType: ProductType;
}
