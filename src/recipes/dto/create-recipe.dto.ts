import { IsNotEmpty } from 'class-validator';
import { CreateIngredientDto } from 'src/ingredients/dto/create-ingredient.dto';

export class CreateRecipeDto {
  @IsNotEmpty()
  IngredientId: number;

  @IsNotEmpty()
  quantity: number;

  recipeId: number;

  ingredient: CreateIngredientDto;
}
