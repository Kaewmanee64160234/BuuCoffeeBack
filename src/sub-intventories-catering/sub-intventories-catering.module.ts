import { Module } from '@nestjs/common';
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';
import { SubIntventoriesCateringController } from './sub-intventories-catering.controller';

@Module({
  controllers: [SubIntventoriesCateringController],
  providers: [SubIntventoriesCateringService]
})
export class SubIntventoriesCateringModule {}
