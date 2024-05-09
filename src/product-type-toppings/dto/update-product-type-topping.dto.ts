import { PartialType } from '@nestjs/mapped-types';
import { CreateProductTypeToppingDto } from './create-product-type-topping.dto';

export class UpdateProductTypeToppingDto extends PartialType(CreateProductTypeToppingDto) {}
