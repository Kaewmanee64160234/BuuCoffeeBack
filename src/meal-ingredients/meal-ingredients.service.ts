import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealIngredients } from './entities/meal-ingredient.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';

@Injectable()
export class MealIngredientsService {
  constructor(
    @InjectRepository(MealIngredients)
    private readonly mealIngredientsRepository: Repository<MealIngredients>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(SubInventoriesRice)
    private readonly subInventoriesRiceRepository: Repository<SubInventoriesRice>,
    @InjectRepository(SubInventoriesCoffee)
    private readonly subInventoriesCoffeeRepository: Repository<SubInventoriesCoffee>,
  ) {}

  async findAll(): Promise<MealIngredients[]> {
    return this.mealIngredientsRepository.find();
  }

  async findOne(mealIngredientId: number): Promise<MealIngredients> {
    const mealIngredient = await this.mealIngredientsRepository.findOne({
      where: { mealIngredientId },
    });
    if (!mealIngredient) {
      throw new NotFoundException('Meal Ingredient not found');
    }
    return mealIngredient;
  }

  async update(
    id: number,
    mealIngredientData: Partial<MealIngredients>,
  ): Promise<MealIngredients> {
    await this.findOne(id);
    await this.mealIngredientsRepository.update(id, mealIngredientData);
    return this.findOne(id);
  }

  // async remove(id: number): Promise<void> {
  //   await this.removeMealIngredient(id);
  // }

  // async removeMealIngredient(id: number): Promise<void> {
  //   const mealIngredient = await this.mealIngredientsRepository.findOne({
  //     where: { id },
  //   });
  //   if (!mealIngredient) {
  //     throw new NotFoundException('Meal Ingredient not found');
  //   }

  //   // Check ingredient type before removal
  //   const ingredient = await this.ingredientRepository.findOne({
  //     where: { ingredientId: mealIngredient.ingredient.ingredientId },
  //   });
  //   if (!ingredient) {
  //     throw new NotFoundException('Ingredient not found');
  //   }

  //   try {
  //     if (ingredient.type === 'warehouse') {
  //       ingredient.ingredientQuantityInStock += mealIngredient.quantity; // Add back on remove
  //     } else if (ingredient.type === 'riceShop') {
  //       const subInventoryRice =
  //         await this.subInventoriesRiceRepository.findOne({
  //           where: { ingredient: { ingredientId: ingredient.ingredientId } },
  //         });
  //       if (subInventoryRice) {
  //         subInventoryRice.quantity += mealIngredient.quantity; // Add back on remove
  //         await this.subInventoriesRiceRepository.save(subInventoryRice);
  //       }
  //     } else if (ingredient.type === 'coffeeShop') {
  //       const subInventoryCoffee =
  //         await this.subInventoriesCoffeeRepository.findOne({
  //           where: { ingredient: { ingredientId: ingredient.ingredientId } },
  //         });
  //       if (subInventoryCoffee) {
  //         subInventoryCoffee.quantity += mealIngredient.quantity; // Add back on remove
  //         await this.subInventoriesCoffeeRepository.save(subInventoryCoffee);
  //       }
  //     }

  //     await this.ingredientRepository.save(ingredient);
  //     await this.mealIngredientsRepository.remove(mealIngredient);
  //   } catch (error) {
  //     throw new InternalServerErrorException('Error removing meal ingredient');
  //   }
  // }
}
