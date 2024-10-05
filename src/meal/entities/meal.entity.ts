import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CateringEvent } from 'src/catering-event/entities/catering-event.entity';
import { MealIngredients } from 'src/meal-ingredients/entities/meal-ingredient.entity';

@Entity()
export class Meal {
  @PrimaryGeneratedColumn()
  mealId: number;

  @ManyToOne(() => CateringEvent, (cateringEvent) => cateringEvent.meals)
  cateringEvent: CateringEvent;

  @Column()
  mealName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'time' })
  mealTime: Date;
  @OneToMany(() => MealIngredients, (mealIngredient) => mealIngredient.meal)
  mealIngredients: MealIngredients[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
