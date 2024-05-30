import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.checkingredientitem)
  ingredient: Ingredient;
}
