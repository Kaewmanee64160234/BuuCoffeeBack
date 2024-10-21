import { PartialType } from '@nestjs/swagger';
import { CreateMealProductDto } from './create-meal-product.dto';

export class UpdateMealProductDto extends PartialType(CreateMealProductDto) {}
