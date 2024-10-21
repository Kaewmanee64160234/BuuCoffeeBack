import { Meal } from 'src/meal/entities/meal.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MealProduct {
  @PrimaryGeneratedColumn()
  mealProductId: number;

  @ManyToOne(() => Meal, (meal) => meal.mealProducts, { eager: true })
  meal: Meal;

  @ManyToOne(() => Product, (product) => product.mealProducts, {
    eager: true,
  })
  product: Product;

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
