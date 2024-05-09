import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Topping {
  @PrimaryGeneratedColumn()
  toppingId: number;
  @Column({ unique: true })
  toppingName: string;
  @Column({ type: 'float' })
  toppingPrice: number;

  @OneToMany(
    () => ProductTypeTopping,
    (productTypeTopping) => productTypeTopping.topping,
  )
  productTypeToppings: ProductTypeTopping[];
}
