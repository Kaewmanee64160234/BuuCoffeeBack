import { Module } from '@nestjs/common';
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';
import { SubIntventoriesCateringController } from './sub-intventories-catering.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubIntventoriesCatering } from './entities/sub-intventories-catering.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubIntventoriesCatering,
      Ingredient,
      SubInventoriesCoffee,
      SubInventoriesRice,
    ]),
  ],
  controllers: [SubIntventoriesCateringController],
  providers: [SubIntventoriesCateringService],
  exports: [SubIntventoriesCateringService],
})
export class SubIntventoriesCateringModule {}
