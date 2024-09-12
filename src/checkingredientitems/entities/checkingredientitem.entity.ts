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
export class Checkingredientitem {
  @PrimaryGeneratedColumn()
  CheckIngredientsItemID: number;

  @Column()
  UsedQuantity: number;

  @ManyToOne(
    () => Checkingredient,
    (checkingredient) => checkingredient.checkingredientitem,
  )
  checkingredient: Checkingredient;
  @Column()
  oldRemain: number;
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.checkingredientitem)
  ingredient: Ingredient;
  @Column({ nullable: true })
  type: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
