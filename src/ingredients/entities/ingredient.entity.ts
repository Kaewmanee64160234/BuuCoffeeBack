import { Category } from 'src/categories/entities/category.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { Product } from 'src/products/entities/product.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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
  ingredientBarcode: string;
  @Column()
  ingredientVolumeUnit: string;
  @Column()
  ingredientQuantityInStock: number;
  @Column()
  ingredientQuantityPerUnit: number;
  @Column()
  ingredientQuantityPerSubUnit: string;
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
  @OneToMany(
    () => SubInventoriesRice,
    (subInventory) => subInventory.ingredient,
  )
  riceShopSubInventories: SubInventoriesRice[];

  @OneToMany(
    () => SubInventoriesCoffee,
    (subInventory) => subInventory.ingredient,
  )
  coffeeShopSubInventories: SubInventoriesCoffee[];
  @ManyToOne(() => Category, (category) => category.ingredient)
  category: Category;

  @OneToOne(() => Product, (product) => product.ingredient)
  product: Product;

  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
