import { Module } from '@nestjs/common';
import { CheckingredientsService } from './checkingredients.service';
import { CheckingredientsController } from './checkingredients.controller';
import { Checkingredient } from './entities/checkingredient.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Checkingredient,
      Checkingredientitem,
      Ingredient,
      User,
      SubInventoriesCoffee,
      SubInventoriesRice,
    ]),
  ],
  controllers: [CheckingredientsController],
  providers: [CheckingredientsService],
})
export class CheckingredientsModule {}
