import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn()
  productTypeId: number;

  @Column()
  productTypeName: string;

  @ManyToOne(() => Product, (product) => product.productTypes)
  product: Product;
}
