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
  quantity: number;

  @ManyToOne(() => ProductType, (productType) => productType.recipes, {
    onDelete: 'CASCADE',
  })
  productType: ProductType;

  @ManyToOne(() => Ingredient, { eager: true })
  ingredient: Ingredient;
}
