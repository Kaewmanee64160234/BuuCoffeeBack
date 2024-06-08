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

  igredientImage: string;

  ingredientId: number;

  @IsString()
  @IsNotEmpty()
  igredientSupplier: string;

  @IsNumber()
  @IsNotEmpty()
  igredientMinimun: number;

  @IsString()
  @IsNotEmpty()
  igredientUnit: string;
  @IsString()
  @IsNotEmpty()
  igredientQuantityPerSubUnit: string;

  @IsNumber()
  @IsNotEmpty()
  igredientQuantityInStock: number;

  @IsNumber()
  @IsNotEmpty()
  igredientQuantityPerUnit: number;

  @IsNumber()
  @IsNotEmpty()
  igredientRemining: number;
}
