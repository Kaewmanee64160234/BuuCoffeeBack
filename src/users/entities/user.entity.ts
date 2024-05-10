import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;
  @Column()
  userName: string;
  @Column()
  userPassword: string;
  @Column()
  userRole: string;
  @Column()
  userEmail: string;
}
