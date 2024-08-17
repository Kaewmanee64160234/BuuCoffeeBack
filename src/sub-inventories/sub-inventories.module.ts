import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesService } from './sub-inventories.service';
import { SubInventoriesController } from './sub-inventories.controller';
import { SubInventory } from './entities/sub-inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubInventory])],
  controllers: [SubInventoriesController],
  providers: [SubInventoriesService],
})
export class SubInventoriesModule {}
