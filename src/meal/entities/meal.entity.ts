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
import { MealProduct } from 'src/meal-products/entities/meal-product.entity';

import { Reciept } from 'src/reciept/entities/reciept.entity';

@Entity()
export class Meal {
  @PrimaryGeneratedColumn()
  mealId: number;

  @ManyToOne(() => CateringEvent, (cateringEvent) => cateringEvent.meals)
  cateringEvent: CateringEvent;

  @Column()
  description: string;

  @Column()
  mealName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'time' })
  mealTime: Date;

  @OneToMany(() => MealProduct, (mealProduct) => mealProduct.meal)
  mealProducts: MealProduct[];

  @ManyToOne(() => Reciept, { nullable: true, eager: true })
  riceReceipt: Reciept;

  @ManyToOne(() => Reciept, { nullable: true, eager: true })
  coffeeReceipt: Reciept;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
