import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  recipeId: number;

  @Column()
  productId: number;

  @Column()
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipes)
  ingredient: Ingredient;

  @Column()
  quantity: number;
}
