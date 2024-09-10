import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
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
export class SubIntventoriesCatering {
  @PrimaryGeneratedColumn()
  subInventoryId: number;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.coffeeShopSubInventories,
  )
  ingredient: Ingredient;

  @ManyToOne(
    () => Checkingredient,
    (checkingredient) => checkingredient.subInventoriesCatering,
  )
  checkingredient: Checkingredient;

  @Column()
  quantity: number;

  @Column()
  type: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;
}
