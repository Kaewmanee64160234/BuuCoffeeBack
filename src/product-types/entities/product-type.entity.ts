import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn()
  productTypeId: number;

  @Column()
  productTypeName: string;

  @ManyToOne(() => Product, (product) => product.productTypes)
  product: Product;

  @OneToMany(
    () => ProductTypeTopping,
    (productTypeTopping) => productTypeTopping.productType,
  )
  productTypeToppings: ProductTypeTopping[];
}
