import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateImportingredientitemDto {
  @IsNotEmpty()
  @IsNumber()
  ingredientId: number;
  @IsNotEmpty()
  @IsNumber()
  unitPrice?: number;
  @IsNotEmpty()
  @IsNumber()
  pricePerUnit?: number;
  name?: string;
  @IsNotEmpty()
  @IsNumber()
  Quantity?: number;
}
