import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { IngredientUsageLog } from 'src/ingredientusagelog/entities/ingredientusagelog.entity';

@Entity()
export class ReceiptItem {
  @PrimaryGeneratedColumn()
  receiptItemId: number;

  @Column({ type: 'numeric' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  receiptSubTotal: number;

  @ManyToOne(() => Reciept, (reciept) => reciept.receiptItems)
  reciept: Reciept;

  @OneToMany(
    () => ProductTypeTopping,
    (productTypeTopping) => productTypeTopping.receiptItem,
    { cascade: true },
  )
  productTypeToppings: ProductTypeTopping[];

  @Column({ nullable: true })
  sweetnessLevel: string;

  @ManyToOne(() => Product, (product) => product.receiptItems)
  product: Product;

  @ManyToOne(() => ProductType, (productType) => productType.receiptItems, {
    onDelete: 'CASCADE',
  })
  productType: ProductType;
  @OneToMany(() => IngredientUsageLog, (usageLog) => usageLog.recieptItem)
  usageLogs: IngredientUsageLog[];
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
