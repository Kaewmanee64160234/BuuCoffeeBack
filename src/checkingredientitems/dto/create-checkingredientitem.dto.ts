import { IsNotEmpty } from 'class-validator';
export class CreateCheckingredientitemDto {
  @IsNotEmpty()
  ingredientId: number;
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  UsedQuantity: number;
}
