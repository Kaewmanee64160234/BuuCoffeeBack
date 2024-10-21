import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMealProductDto {
  @IsNotEmpty()
  mealId: number;
  @IsNotEmpty()
  productId: number;
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
