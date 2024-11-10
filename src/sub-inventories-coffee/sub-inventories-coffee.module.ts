import { Module } from '@nestjs/common';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';
import { SubInventoriesCoffeeController } from './sub-inventories-coffee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';
import { UsersModule } from 'src/users/users.module';
import { Product } from 'src/products/entities/product.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubInventoriesCoffee, Product, Ingredient]),
    UsersModule,
  ],
  controllers: [SubInventoriesCoffeeController],
  providers: [SubInventoriesCoffeeService],
  exports: [SubInventoriesCoffeeService],
})
export class SubInventoriesCoffeeModule {}
