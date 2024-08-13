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
  @Column('decimal', { precision: 10, scale: 2 })
  pricePerUnit: number;
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
  @Column()
  Quantity: number;
  @Column({ nullable: true }) // สำหรับ"ร้านข้าว"
  name: string;
  @ManyToOne(
    () => Importingredient,
    (importingredient) => importingredient.importingredientitem,
  )
  importingredient: Importingredient;
  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.importingredientitem,
    { nullable: true },
  )
  ingredient: Ingredient;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
