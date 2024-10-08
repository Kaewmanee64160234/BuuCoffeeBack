import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDecimal,
} from 'class-validator';

export class CreateMealIngredientDto {
  @IsNotEmpty()
  mealId: number;

  @IsNotEmpty()
  ingredientId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,2' })
  totalPrice: number;

  @IsNotEmpty()
  @IsString()
  type: string; // (warehouse, riceShop, coffeeShop)

  @IsOptional()
  createdDate?: Date;

  @IsOptional()
  updatedDate?: Date;
}
