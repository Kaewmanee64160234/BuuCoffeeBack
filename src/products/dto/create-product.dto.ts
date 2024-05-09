import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
