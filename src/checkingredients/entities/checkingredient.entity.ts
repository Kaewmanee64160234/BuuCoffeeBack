import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';

@Entity()
export class Checkingredient {
  @PrimaryGeneratedColumn()
  CheckID: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
  @Column({ type: 'varchar', length: 50 })
  actionType: string; // withdrawal  หรือ return
  @ManyToOne(() => User, (user) => user.checkingredients)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  shopType: string; // coffee  หรือ rice

  @Column()
  checkDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;
  @OneToMany(
    () => Checkingredientitem,
    (checkingredientitem) => checkingredientitem.checkingredient,
  )
  checkingredientitem: Checkingredientitem[];

  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
