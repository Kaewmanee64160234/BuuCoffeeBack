import { PartialType } from '@nestjs/mapped-types';
import { CreateExportingredientDto } from './create-exportingredient.dto';

export class UpdateExportingredientDto extends PartialType(CreateExportingredientDto) {}
