import { CreateMealDto } from 'src/meal/dto/create-meal.dto';
export class CreateCateringEventDto {
  userId: number;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  attendeeCount: number;
  totalBudget: number;
  actionType: string;
  mealDto: CreateMealDto[];
}
