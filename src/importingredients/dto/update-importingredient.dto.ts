import { PartialType } from '@nestjs/mapped-types';
import { CreateImportingredientDto } from './create-importingredient.dto';

export class UpdateImportingredientDto extends PartialType(
  CreateImportingredientDto,
) {}
