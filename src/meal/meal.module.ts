import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, Reciept])],
  controllers: [MealController],
  providers: [MealService],
})
export class MealModule {}
