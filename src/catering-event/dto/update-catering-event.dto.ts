import { PartialType } from '@nestjs/swagger';
import { CreateCateringEventDto } from './create-catering-event.dto';

export class UpdateCateringEventDto extends PartialType(
  CreateCateringEventDto,
) {}
