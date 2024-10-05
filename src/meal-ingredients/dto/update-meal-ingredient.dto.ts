import { PartialType } from '@nestjs/swagger';
import { CreateMealIngredientDto } from './create-meal-ingredient.dto';

export class UpdateMealIngredientDto extends PartialType(
  CreateMealIngredientDto,
) {}
