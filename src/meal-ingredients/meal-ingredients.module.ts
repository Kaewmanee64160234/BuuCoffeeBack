import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealIngredientsService } from './meal-ingredients.service';
import { MealIngredients } from './entities/meal-ingredient.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { MealIngredientsController } from './meal-ingredients.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MealIngredients,
      Ingredient,
      SubInventoriesRice,
      SubInventoriesCoffee,
    ]),
  ],
  controllers: [MealIngredientsController],
  providers: [MealIngredientsService],
})
export class MealIngredientsModule {}
