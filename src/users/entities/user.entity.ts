import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Cashier } from 'src/cashiers/entities/cashier.entity';
import { Role } from 'src/role/entities/role.entity';
import { CateringEvent } from 'src/catering-event/entities/catering-event.entity';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
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
  @OneToMany(() => CateringEvent, (cateringevent) => cateringevent.user)
  organizer: CateringEvent[];
  @OneToMany(() => Cashier, (cashier) => cashier.openedBy)
  openedCashiers: Cashier[];

  @OneToMany(() => Cashier, (cashier) => cashier.closedBy)
  closedCashiers: Cashier[];

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  groupMemberships: GroupMember[];

  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
}
