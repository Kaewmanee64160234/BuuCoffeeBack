import { Module } from '@nestjs/common';
import { CheckingredientsService } from './checkingredients.service';
import { CheckingredientsController } from './checkingredients.controller';
import { Checkingredient } from './entities/checkingredient.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventory } from 'src/sub-inventories/entities/sub-inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Checkingredient,
      Checkingredientitem,
      Ingredient,
      User,
      SubInventory,
    ]),
  ],
  controllers: [CheckingredientsController],
  providers: [CheckingredientsService],
})
export class CheckingredientsModule {}
