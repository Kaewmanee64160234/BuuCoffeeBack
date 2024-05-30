import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckingredientitemDto } from './create-checkingredientitem.dto';

export class UpdateCheckingredientitemDto extends PartialType(
  CreateCheckingredientitemDto,
) {}
