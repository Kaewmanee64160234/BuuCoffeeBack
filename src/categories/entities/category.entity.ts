import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  categoryId: number;

  @Column({ unique: true })
  categoryName: string;

  @Column({ default: false })
  haveTopping: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
