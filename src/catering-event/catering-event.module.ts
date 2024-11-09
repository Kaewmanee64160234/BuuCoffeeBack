import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CateringEventService } from './catering-event.service';
import { CateringEventController } from './catering-event.controller';
import { CateringEvent } from './entities/catering-event.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Meal } from 'src/meal/entities/meal.entity';
import { MealProduct } from 'src/meal-products/entities/meal-product.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CateringEvent,
      Product,
      User,
      Meal,
      MealProduct,
      Reciept,
      SubInventoriesCoffee,
      Ingredient,
    ]),
  ],
  controllers: [CateringEventController],
  providers: [CateringEventService],
  exports: [CateringEventService],
})
export class CateringEventModule {}
