import { PartialType } from '@nestjs/swagger';
import { CreateSubIntventoriesCateringDto } from './create-sub-intventories-catering.dto';

export class UpdateSubIntventoriesCateringDto extends PartialType(CreateSubIntventoriesCateringDto) {}
