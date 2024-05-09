import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductTypeTopping {
  @PrimaryGeneratedColumn()
  productTypeToppingId: number;

  @Column({ type: 'numeric' })
  quantity: number;

  @ManyToOne(
    () => ProductType,
    (productType) => productType.productTypeToppings,
  )
  productType: ProductType;

  @ManyToOne(() => Topping, (topping) => topping.productTypeToppings)
  topping: Topping;
}
