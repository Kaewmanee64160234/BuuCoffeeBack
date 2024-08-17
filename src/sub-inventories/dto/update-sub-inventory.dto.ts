import { PartialType } from '@nestjs/swagger';
import { CreateSubInventoryDto } from './create-sub-inventory.dto';

export class UpdateSubInventoryDto extends PartialType(CreateSubInventoryDto) {}
