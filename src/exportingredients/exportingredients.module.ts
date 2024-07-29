import { Module } from '@nestjs/common';
import { ExportIngredientService } from './exportingredients.service';
import { ExportingredientsController } from './exportingredients.controller';
import { Exportingredient } from './entities/exportingredient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Exportingredient])],
  controllers: [ExportingredientsController],
  providers: [ExportIngredientService],
})
export class ExportingredientsModule {}
