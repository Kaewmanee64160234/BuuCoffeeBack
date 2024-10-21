import { Module } from '@nestjs/common';
import { MealProductsService } from './meal-products.service';
import { MealProductsController } from './meal-products.controller';

@Module({
  controllers: [MealProductsController],
  providers: [MealProductsService]
})
export class MealProductsModule {}
