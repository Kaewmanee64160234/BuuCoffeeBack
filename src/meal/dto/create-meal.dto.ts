import { Type } from 'class-transformer';
import {
  IsString,
  IsDecimal,
  IsNotEmpty,
  IsDate,
  IsOptional,
  isString,
} from 'class-validator';
import { CreateMealProductDto } from 'src/meal-products/dto/create-meal-product.dto';

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

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  cateringEventId: number;
  @IsNotEmpty()
  mealProducts: CreateMealProductDto[];

  @IsOptional()
  riceReceiptId: number;

  @IsOptional()
  coffeeReceiptId: number;
}
