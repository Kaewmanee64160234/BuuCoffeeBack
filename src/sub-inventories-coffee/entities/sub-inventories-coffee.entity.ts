import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SubInventoriesCoffee {
  @PrimaryGeneratedColumn()
  subInventoryId: number;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.coffeeShopSubInventories,
  )
  ingredient: Ingredient;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;
}
