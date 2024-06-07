import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  ingredientId: number;
  @Column({ nullable: true, default: null })
  igredientImage: string;
  @Column()
  ingredientName: string;
  @Column()
  igredientSupplier: string;
  @Column()
  igredientMinimun: number;
  @Column()
  igredientUnit: string;
  @Column()
  igredientQuantityInStock: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  igredientQuantityPerUnit: number;
  @Column()
  igredientQuantityPerSubUnit: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  igredientRemining: number;
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
}
