import { Module } from '@nestjs/common';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';
import { SubInventoriesCoffeeController } from './sub-inventories-coffee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubInventoriesCoffee])],
  controllers: [SubInventoriesCoffeeController],
  providers: [SubInventoriesCoffeeService],
  exports: [SubInventoriesCoffeeService],
})
export class SubInventoriesCoffeeModule {}
