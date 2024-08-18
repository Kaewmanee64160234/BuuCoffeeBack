import { PartialType } from '@nestjs/swagger';
import { CreateSubInventoriesCoffeeDto } from './create-sub-inventories-coffee.dto';

export class UpdateSubInventoriesCoffeeDto extends PartialType(CreateSubInventoriesCoffeeDto) {}
