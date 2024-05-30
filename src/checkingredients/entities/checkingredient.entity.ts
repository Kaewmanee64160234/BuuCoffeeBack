import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Checkingredient {
  @PrimaryGeneratedColumn()
  CheckID: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => User, (user) => user.checkingredients)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
    () => Checkingredientitem,
    (checkingredientitem) => checkingredientitem.checkingredient,
  )
  checkingredientitem: Checkingredientitem[];
}
