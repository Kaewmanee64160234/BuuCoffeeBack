import { Module } from '@nestjs/common';
import { IngredientusagelogService } from './ingredientusagelog.service';
import { IngredientusagelogController } from './ingredientusagelog.controller';
import { IngredientUsageLog } from './entities/ingredientusagelog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      IngredientUsageLog,
      Checkingredientitem,
      Checkingredient,
      Ingredient,
    ]),
  ],
  controllers: [IngredientusagelogController],
  providers: [IngredientusagelogService],
})
export class IngredientusagelogModule {}
