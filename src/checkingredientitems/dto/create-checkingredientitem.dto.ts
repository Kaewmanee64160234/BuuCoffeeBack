import { IsNotEmpty } from 'class-validator';
export class CreateCheckingredientitemDto {
  @IsNotEmpty()
  ingredientId: number;
  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  oldRemain: number;

  @IsNotEmpty()
  UsedQuantity: number;
}
