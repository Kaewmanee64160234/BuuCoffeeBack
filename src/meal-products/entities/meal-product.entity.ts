import { Meal } from 'src/meal/entities/meal.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MealProduct {
  @PrimaryGeneratedColumn()
  mealProductId: number;

  @ManyToOne(() => Meal, (meal) => meal.mealProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mealMealId' })
  meal: Meal;

  @ManyToOne(() => Product, (product) => product.mealProducts, {
    eager: true,
    nullable: true,
  })
  product: Product;

  @Column({ type: 'varchar', length: 50 })
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @OneToMany(() => ReceiptItem, (receiptItem) => receiptItem.mealProduct)
  receiptItems: ReceiptItem[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
