import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckingredientDto } from './create-checkingredient.dto';

export class UpdateCheckingredientDto extends PartialType(CreateCheckingredientDto) {}
