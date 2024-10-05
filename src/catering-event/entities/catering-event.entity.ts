import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Meal } from 'src/meal/entities/meal.entity';

@Entity()
export class CateringEvent {
  @PrimaryGeneratedColumn()
  eventId: number;

  @Column()
  eventName: string;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column()
  eventLocation: string;

  @Column()
  attendeeCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalBudget: number;
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; //  'pending', 'paid', 'canceled'
  @OneToMany(() => Meal, (meal) => meal.cateringEvent)
  meals: Meal[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.organizer)
  @JoinColumn({ name: 'userId' })
  user: User;
}
