import { PartialType } from '@nestjs/mapped-types';
import { CreateImportingredientitemDto } from './create-importingredientitem.dto';

export class UpdateImportingredientitemDto extends PartialType(
  CreateImportingredientitemDto,
) {}
