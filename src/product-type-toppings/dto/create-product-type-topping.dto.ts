import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductTypeToppingDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @IsNotEmpty()
  @IsNumber()
  productTypeId: number;
  @IsNotEmpty()
  @IsNumber()
  toppingId: number;
}
