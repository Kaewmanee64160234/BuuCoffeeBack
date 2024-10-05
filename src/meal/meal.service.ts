import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { CreateMealDto } from './dto/create-meal.dto';

@Injectable()
export class MealService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
  ) {}

  async create(createMealDto: CreateMealDto): Promise<Meal> {
    const meal = this.mealRepository.create(createMealDto);
    return await this.mealRepository.save(meal);
  }

  async findAll(): Promise<Meal[]> {
    return await this.mealRepository.find();
  }

  async findOne(mealId: number): Promise<Meal> {
    return await this.mealRepository.findOne({ where: { mealId } });
  }

  async update(mealId: number, updateMealDto: Partial<Meal>): Promise<Meal> {
    await this.mealRepository.update(mealId, updateMealDto);
    return this.findOne(mealId);
  }

  async remove(mealId: number): Promise<void> {
    await this.mealRepository.delete(mealId);
  }
}
