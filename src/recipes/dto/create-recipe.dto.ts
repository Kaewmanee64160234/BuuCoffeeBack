import { IsNotEmpty } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  ingredientId: number;

  @IsNotEmpty()
  quantity: number;
}
