import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  IngredientId: number;
  @Column({ nullable: true, default: null })
  IngredientImage: string;

  @Column()
  nameIngredient: string;
  @Column()
  supplier: string;
  @Column()
  minimun: number;
  @Column()
  unit: string;
  @Column()
  quantityInStock: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityPerUnit: number;
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
