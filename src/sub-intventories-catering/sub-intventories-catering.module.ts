import { Module } from '@nestjs/common';
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';
import { SubIntventoriesCateringController } from './sub-intventories-catering.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubIntventoriesCatering } from './entities/sub-intventories-catering.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubIntventoriesCatering])],
  controllers: [SubIntventoriesCateringController],
  providers: [SubIntventoriesCateringService],
})
export class SubIntventoriesCateringModule {}
