import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { Reciept } from 'src/reciept/entities/reciept.entity';

@Injectable()
export class MealService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(Reciept)
    private readonly recieptRepository: Repository<Reciept>,
  ) {}

  async create(mealData: CreateMealDto) {
    // const cateringEvent = await this.cateringEventRepository.findOne({
    //   where: { mealId: +cateringEventId },
    // });
    // if (!cateringEvent) throw new NotFoundException('Catering event not found');

    const meal = new Meal();
    meal.mealName = mealData.mealName;
    meal.mealTime = mealData.mealTime;
    meal.description = mealData.description;
    meal.totalPrice = mealData.totalPrice;
    // meal.cateringEvent = cateringEvent;

    // Link receipts if provided
    if (mealData.riceReceiptId) {
      const riceReceipt = await this.recieptRepository.findOne({
        where: { receiptId: mealData.riceReceiptId },
      });
      if (!riceReceipt) throw new NotFoundException('Rice receipt not found');
      meal.riceReceipt = riceReceipt;
    }

    if (mealData.coffeeReceiptId) {
      const coffeeReceipt = await this.recieptRepository.findOne({
        where: { receiptId: mealData.coffeeReceiptId },
      });
      if (!coffeeReceipt)
        throw new NotFoundException('Coffee receipt not found');
      meal.coffeeReceipt = coffeeReceipt;
    }

    // Save meal
    return this.mealRepository.save(meal);
  }

  async findAll(): Promise<Meal[]> {
    return await this.mealRepository.find();
  }

  async findOne(mealId: number): Promise<Meal> {
    return await this.mealRepository.findOne({ where: { mealId } });
  }

  async update(mealId: number, updateMealDto: CreateMealDto): Promise<Meal> {
    await this.mealRepository.update(mealId, updateMealDto);
    return this.findOne(mealId);
  }

  async remove(mealId: number): Promise<void> {
    await this.mealRepository.delete(mealId);
  }
}
