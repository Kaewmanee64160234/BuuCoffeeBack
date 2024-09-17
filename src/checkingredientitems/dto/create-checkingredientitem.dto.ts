import { IsNotEmpty } from 'class-validator';
export class CreateCheckingredientitemDto {
  @IsNotEmpty()
  ingredientId: number;
  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  oldRemain: number;
  type?: string;

  unitPrice?: number;
  subTotalPrice?: number;
  @IsNotEmpty()
  UsedQuantity: number;
}
