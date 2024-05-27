import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateRecipeDto } from 'src/recipes/dto/create-recipe.dto';

export class CreateProductTypeDto {
  productTypeId: number;
  @IsString()
  @IsNotEmpty()
  productTypeName: string;

  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  productTypePrice: number;

  recipes: CreateRecipeDto[];
}
