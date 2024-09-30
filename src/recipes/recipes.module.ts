import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Ingredient]), UsersModule],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
