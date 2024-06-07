import {
  IsNotEmpty,
  Length,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  nameIngredient: string;

  IngredientImage: string;

  IngredientId: number;

  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsNumber()
  @IsNotEmpty()
  minimun: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsNotEmpty()
  quantityInStock: number;

  @IsNumber()
  @IsNotEmpty()
  quantityPerUnit: number;
}
