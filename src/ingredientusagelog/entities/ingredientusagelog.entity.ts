import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class IngredientUsageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.usageLogs)
  ingredient: Ingredient;

  @ManyToOne(() => ReceiptItem, (recieptItem) => recieptItem.usageLogs)
  recieptItem: ReceiptItem;

  @Column('float')
  usedQuantity: number;

  @Column()
  unit: number;

  @CreateDateColumn()
  createdAt: Date;
}
