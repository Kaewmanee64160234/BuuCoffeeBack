import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateMealDto } from 'src/meal/dto/create-meal.dto';
import { Meal } from 'src/meal/entities/meal.entity';
import { User } from 'src/users/entities/user.entity';
export class CreateCateringEventDto {
  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  eventName: string;
  @IsNotEmpty()
  eventDate: Date;
  @IsNotEmpty()
  eventLocation: string;
  @IsNotEmpty()
  attendeeCount: number;
  @IsNotEmpty()
  totalBudget: number;
  @IsNotEmpty()
  actionType: string;
  @IsNotEmpty()
  mealDto: CreateMealDto[];
  cashierAmount: number;
  @IsNotEmpty()
  user: User;
  @IsNotEmpty()
  meals: Meal[];
  @IsNotEmpty()
  status: string;
}
