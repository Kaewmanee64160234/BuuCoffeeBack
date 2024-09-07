import { PartialType } from '@nestjs/swagger';
import { CreateIngredientusagelogDto } from './create-ingredientusagelog.dto';

export class UpdateIngredientusagelogDto extends PartialType(
  CreateIngredientusagelogDto,
) {}
