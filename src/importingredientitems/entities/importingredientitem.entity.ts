import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
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
export class Importingredientitem {
  @PrimaryGeneratedColumn()
  importIngredientsItemID: number;
  @Column()
  pricePerUnit: number;
  @Column()
  unitPrice: number;
  @Column()
  Quantity: number;
  @ManyToOne(
    () => Importingredient,
    (importingredient) => importingredient.importingredientitem,
  )
  importingredient: Importingredient;
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.importingredientitem)
  ingredient: Ingredient;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
