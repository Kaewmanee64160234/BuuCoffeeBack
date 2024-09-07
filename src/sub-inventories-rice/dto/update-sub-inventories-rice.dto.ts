import { PartialType } from '@nestjs/swagger';
import { CreateSubInventoriesRiceDto } from './create-sub-inventories-rice.dto';

export class UpdateSubInventoriesRiceDto extends PartialType(
  CreateSubInventoriesRiceDto,
) {}
