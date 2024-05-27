import { IsNotEmpty } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  productId: number;

  @IsNotEmpty()
  ingradientId: number;

  @IsNotEmpty()
  quantity: number;
}
