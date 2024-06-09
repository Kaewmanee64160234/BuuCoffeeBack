import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Recipe } from './entities/recipe.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
  ) {}
  async create(createRecipeDto: CreateRecipeDto) {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: +createRecipeDto.IngredientId },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      const newRecipe = new Recipe();
      newRecipe.ingredient = ingredient;
      newRecipe.quantity = createRecipeDto.quantity;
      const savedRecipe = await this.recipeRepository.save(newRecipe);
      return savedRecipe;
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    try {
      return this.recipeRepository.find({ relations: ['ingredient'] });
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: number) {
    try {
      return this.recipeRepository.findOne({
        where: { recipeId: id },
        relations: ['ingredient'],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    try {
      const recipe = await this.recipeRepository.findOne({
        where: { recipeId: id },
        relations: ['ingredient'],
      });
      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: recipe.ingredient.ingredientId },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      recipe.ingredient = ingredient;
      recipe.quantity = updateRecipeDto.quantity;
      this.recipeRepository.save(recipe);
      return this.recipeRepository.findOne({
        where: { recipeId: id },
        relations: ['ingredient'],
      });
    } catch (error) {
      console.log(error);
    }
  }

  remove(id: number) {
    try {
      const recipe = this.recipeRepository.findOne({
        where: { recipeId: id },
      });
      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }
      return this.recipeRepository.delete(id);
    } catch (error) {
      console.log(error);
    }
  }
}
