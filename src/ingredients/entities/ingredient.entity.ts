import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  ingredientId: number;
  @Column({ nullable: true, default: null })
  ingredientImage: string;
  @Column()
  ingredientName: string;
  @Column()
  ingredientSupplier: string;
  @Column()
  ingredientMinimun: number;
  @Column()
  ingredientUnit: string;
  @Column()
  ingredientQuantityInStock: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ingredientQuantityPerUnit: number;
  @Column()
  ingredientQuantityPerSubUnit: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ingredientRemining: number;
  @OneToMany(() => Recipe, (recipe) => recipe.ingredient)
  recipes: Recipe[];
  @OneToMany(
    () => Importingredientitem,
    (importingredientitem) => importingredientitem.ingredient,
  )
  importingredientitem: Importingredientitem[];
  @OneToMany(
    () => Checkingredientitem,
    (checkingredientitem) => checkingredientitem.ingredient,
  )
  checkingredientitem: Checkingredientitem[];
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
