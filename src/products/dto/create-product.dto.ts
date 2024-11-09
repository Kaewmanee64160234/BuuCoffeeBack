import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { CreateProductTypeDto } from 'src/product-types/dto/create-product-type.dto';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from '../entities/product.entity';
import { CreateIngredientDto } from 'src/ingredients/dto/create-ingredient.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @IsOptional()
  ingredientDto: CreateIngredientDto;

  productImage: string;

  barcode: string;
  storeType: string;
  @IsNotEmpty()
  haveTopping: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  createIngredientDto: CreateIngredientDto;

  category: Category;
  product: Product;
  countingPoint: string;
  productTypes: CreateProductTypeDto[];
}
