import { Category } from 'src/categories/entities/category.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column()
  productName: string;

  @Column({ type: 'float' })
  productPrice: number;

  @Column({ default: 'no-image.jpg' })
  productImage: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
