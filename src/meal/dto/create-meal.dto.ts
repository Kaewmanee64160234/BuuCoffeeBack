import { Type } from 'class-transformer';
import { IsString, IsDecimal, IsNotEmpty, IsDate } from 'class-validator';
import { CreateMealIngredientDto } from 'src/meal-ingredients/dto/create-meal-ingredient.dto';

export class CreateMealDto {
  @IsNotEmpty()
  @IsString()
  mealName: string;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  totalPrice: number;

  @IsNotEmpty()
  @IsDate()
  mealTime: Date;

  @IsNotEmpty()
  cateringEventId: number;
  @IsNotEmpty()
  mealIngredientDto: CreateMealIngredientDto[];
}
