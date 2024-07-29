import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Cashier } from 'src/cashiers/entities/cashier.entity';
import { Exportingredient } from 'src/exportingredients/entities/exportingredient.entity';
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
  @OneToMany(
    () => Exportingredient,
    (exportingredient) => exportingredient.user,
  )
  exportingredients: Exportingredient[];
  @OneToMany(() => Reciept, (reciept) => reciept.customer)
  importingredients: Importingredient[];
  @OneToMany(() => Checkingredient, (checkingredient) => checkingredient.user)
  checkingredients: Checkingredient[];
  @OneToMany(() => Cashier, (cashier) => cashier.user)
  cashiers: Cashier[];
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
