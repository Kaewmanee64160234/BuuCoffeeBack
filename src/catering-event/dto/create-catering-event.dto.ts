import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateMealDto } from 'src/meal/dto/create-meal.dto';
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
  @IsOptional()
  riceReceiptId: number;
  @IsOptional()
  coffeeReceiptId: number;
}
