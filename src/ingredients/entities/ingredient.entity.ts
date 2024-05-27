import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  IngredientId: number;
  @Column({ default: 'no-image.jpg' })
  IngredientImage: string;
  @Column()
  nameIngredient: string;
  @Column()
  supplier: string;
  @Column()
  minimun: number;
  @Column()
  unit: string;
  @Column()
  quantityInStock: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityPerUnit: number;
  @Column()
  @OneToMany(() => Recipe, (recipe) => recipe.ingredient)
  recipes: Recipe[];
}
