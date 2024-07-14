import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  recipeId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  quantity: number;

  @ManyToOne(() => ProductType, (productType) => productType.recipes, {
    onDelete: 'CASCADE',
  })
  productType: ProductType;

  @ManyToOne(() => Ingredient, { eager: true })
  ingredient: Ingredient;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
