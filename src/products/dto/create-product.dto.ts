import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { CreateProductTypeDto } from 'src/product-types/dto/create-product-type.dto';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  productImage: string;

  barcode: string;
  storeType: string;
  @IsBoolean()
  @IsNotEmpty()
  haveTopping: boolean;

  @IsNumber()
  @IsNotEmpty()
  categoryId: string;
  category: Category;
  product: Product;
  countingPoint: boolean;
  productTypes: CreateProductTypeDto[];
}
