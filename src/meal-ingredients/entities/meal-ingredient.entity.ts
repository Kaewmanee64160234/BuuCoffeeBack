import { Meal } from 'src/meal/entities/meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MealIngredients {
  @PrimaryGeneratedColumn()
  mealIngredientId: number;

  @ManyToOne(() => Meal, (meal) => meal.mealIngredients, { eager: true })
  meal: Meal;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.mealIngredients, {
    eager: true,
  })
  ingredient: Ingredient;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
