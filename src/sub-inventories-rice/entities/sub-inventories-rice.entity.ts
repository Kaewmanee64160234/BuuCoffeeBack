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
export class SubInventoriesRice {
  @PrimaryGeneratedColumn()
  subInventoryId: number;

  @Column()
  shopType: string;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.riceShopSubInventories,
  )
  ingredient: Ingredient;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;
}
