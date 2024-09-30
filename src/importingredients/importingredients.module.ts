import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportingredientsService } from './importingredients.service';
import { Importingredient } from './entities/importingredient.entity';
import { Importingredientitem } from '../importingredientitems/entities/importingredientitem.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { User } from '../users/entities/user.entity';
import { ImportingredientsController } from './importingredients.controller';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Importingredient,
      Importingredientitem,
      Ingredient,
      User,
      Reciept,
    ]),
    UsersModule,
  ],
  controllers: [ImportingredientsController],
  providers: [ImportingredientsService],
  exports: [ImportingredientsService],
})
export class ImportingredientsModule {}
