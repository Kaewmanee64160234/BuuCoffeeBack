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
  ingredientName: string;

  ingredientImage: string;

  ingredientId: number;

  @IsString()
  @IsNotEmpty()
  ingredientSupplier: string;

  @IsNumber()
  @IsNotEmpty()
  ingredientMinimun: number;

  @IsString()
  @IsNotEmpty()
  ingredientUnit: string;
  @IsString()
  @IsNotEmpty()
  ingredientQuantityPerSubUnit: string;

  @IsNumber()
  @IsNotEmpty()
  ingredientQuantityInStock: number;

  @IsNumber()
  @IsNotEmpty()
  ingredientQuantityPerUnit: number;

  @IsNumber()
  @IsNotEmpty()
  ingredientRemining: number;
}
