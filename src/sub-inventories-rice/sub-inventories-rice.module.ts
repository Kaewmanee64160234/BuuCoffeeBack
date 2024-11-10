import { Module } from '@nestjs/common';
import { SubInventoriesRiceService } from './sub-inventories-rice.service';
import { SubInventoriesRiceController } from './sub-inventories-rice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesRice } from './entities/sub-inventories-rice.entity';
import { UsersModule } from 'src/users/users.module';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubInventoriesRice, Ingredient, Product]),
    UsersModule,
  ],
  controllers: [SubInventoriesRiceController],
  providers: [SubInventoriesRiceService],
  exports: [SubInventoriesRiceService],
})
export class SubInventoriesRiceModule {}
