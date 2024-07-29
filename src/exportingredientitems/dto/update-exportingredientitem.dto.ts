import { PartialType } from '@nestjs/mapped-types';
import { CreateExportingredientitemDto } from './create-exportingredientitem.dto';

export class UpdateExportingredientitemDto extends PartialType(CreateExportingredientitemDto) {}
