import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Topping {
  @PrimaryGeneratedColumn()
  toppingId: number;
  @Column({ unique: true })
  toppingName: string;
  @Column({ type: 'float' })
  toppingPrice: number;
}
