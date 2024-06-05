import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
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
  @Column()
  userStatus: string;
  @OneToMany(() => Reciept, (reciept) => reciept.user)
  reciepts: Reciept[];
  user: User;
  @OneToMany(
    () => Importingredient,
    (importingredient) => importingredient.user,
  )
  @OneToMany(() => Reciept, (reciept) => reciept.customer)
  importingredients: Importingredient[];
  @OneToMany(() => Checkingredient, (checkingredient) => checkingredient.user)
  checkingredients: Checkingredient[];
}
