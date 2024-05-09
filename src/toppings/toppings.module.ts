import { Module } from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { ToppingsController } from './toppings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topping } from './entities/topping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topping])],
  controllers: [ToppingsController],
  providers: [ToppingsService],
})
export class ToppingsModule {}
