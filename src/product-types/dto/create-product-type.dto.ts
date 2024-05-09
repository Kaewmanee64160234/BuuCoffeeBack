import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  productTypeName: string;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
