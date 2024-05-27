import { IsNotEmpty } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  productId: number;

  @IsNotEmpty()
  ingredientId: number;

  @IsNotEmpty()
  quantity: number;
}
