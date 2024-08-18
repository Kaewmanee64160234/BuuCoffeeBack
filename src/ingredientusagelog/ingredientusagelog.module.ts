import { Module } from '@nestjs/common';
import { IngredientusagelogService } from './ingredientusagelog.service';
import { IngredientusagelogController } from './ingredientusagelog.controller';
import { IngredientUsageLog } from './entities/ingredientusagelog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([IngredientUsageLog])],
  controllers: [IngredientusagelogController],
  providers: [IngredientusagelogService],
})
export class IngredientusagelogModule {}
