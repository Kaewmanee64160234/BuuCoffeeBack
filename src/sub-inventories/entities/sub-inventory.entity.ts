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
export class SubInventory {
  @PrimaryGeneratedColumn()
  subInventoryId: number;

  @Column()
  shopType: string;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.subinventories)
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
