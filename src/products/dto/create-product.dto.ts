import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ProductType } from 'src/product-types/entities/product-type.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  productImage: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  productTypes: ProductType[];
}
