import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportingredientsService } from './importingredients.service';
import { Importingredient } from './entities/importingredient.entity';
import { Importingredientitem } from '../importingredientitems/entities/importingredientitem.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { User } from '../users/entities/user.entity';
import { ImportingredientsController } from './importingredients.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Importingredient,
      Importingredientitem,
      Ingredient,
      User,
    ]),
  ],
  controllers: [ImportingredientsController],
  providers: [ImportingredientsService],
  exports: [ImportingredientsService],
})
export class ImportingredientsModule {}
