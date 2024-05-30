import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
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
  @ManyToOne(() => Reciept, (reciept) => reciept.user)
  reciepts: Reciept[];
  @OneToMany(
    () => Importingredient,
    (importingredient) => importingredient.user,
  )
  importingredients: Importingredient[];
}
