import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MealIngredientsService } from './meal-ingredients.service';
import { CreateMealIngredientDto } from './dto/create-meal-ingredient.dto';
import { UpdateMealIngredientDto } from './dto/update-meal-ingredient.dto';
import { MealIngredients } from './entities/meal-ingredient.entity';

@Controller('meal-ingredients') // กำหนด path สำหรับ controller นี้
export class MealIngredientsController {
  constructor(
    private readonly mealIngredientsService: MealIngredientsService,
  ) {}

  @Get()
  async findAll(): Promise<MealIngredients[]> {
    return this.mealIngredientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<MealIngredients> {
    return this.mealIngredientsService.findOne(id);
  }

  @Post(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMealIngredientDto: UpdateMealIngredientDto,
  ): Promise<MealIngredients> {
    return this.mealIngredientsService.update(id, updateMealIngredientDto);
  }
}
