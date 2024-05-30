import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Importingredient {
  @PrimaryGeneratedColumn()
  importID: number;
  @Column({ type: 'datetime' })
  date: Date;
  @Column()
  store: string;
  @Column()
  discount: number;
  @Column()
  total: number;
  @ManyToOne(() => User, (user) => user.importingredients)
  user: User;
  @OneToMany(
    () => Importingredientitem,
    (importingredientitem) => importingredientitem.importingredient,
  )
  importingredientitem: Importingredientitem[];
}
