import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MealProductsService } from './meal-products.service';
import { CreateMealProductDto } from './dto/create-meal-product.dto';
import { UpdateMealProductDto } from './dto/update-meal-product.dto';

@Controller('meal-products')
export class MealProductsController {
  constructor(private readonly mealProductsService: MealProductsService) {}

  @Post()
  create(@Body() createMealProductDto: CreateMealProductDto) {
    return this.mealProductsService.create(createMealProductDto);
  }

  @Get()
  findAll() {
    return this.mealProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMealProductDto: UpdateMealProductDto) {
    return this.mealProductsService.update(+id, updateMealProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealProductsService.remove(+id);
  }
}
