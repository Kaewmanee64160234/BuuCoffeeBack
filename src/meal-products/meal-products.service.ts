import { Injectable } from '@nestjs/common';
import { CreateMealProductDto } from './dto/create-meal-product.dto';
import { UpdateMealProductDto } from './dto/update-meal-product.dto';

@Injectable()
export class MealProductsService {
  create(createMealProductDto: CreateMealProductDto) {
    return 'This action adds a new mealProduct';
  }

  findAll() {
    return `This action returns all mealProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mealProduct`;
  }

  update(id: number, updateMealProductDto: UpdateMealProductDto) {
    return `This action updates a #${id} mealProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} mealProduct`;
  }
}
