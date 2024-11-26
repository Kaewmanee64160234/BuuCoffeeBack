import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CateringEvent } from './entities/catering-event.entity';
import { User } from 'src/users/entities/user.entity';
import { Meal } from 'src/meal/entities/meal.entity';
import { MealProduct } from 'src/meal-products/entities/meal-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { CreateCateringEventDto } from './dto/create-catering-event.dto';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { log } from 'console';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';

@Injectable()
export class CateringEventService {
  constructor(
    @InjectRepository(CateringEvent)
    private cateringEventRepository: Repository<CateringEvent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // productRepository
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    // mealRepository
    @InjectRepository(Meal)
    private mealRepository: Repository<Meal>,
    // mealProductRepository
    @InjectRepository(MealProduct)
    private mealProductRepository: Repository<MealProduct>,
    // receipt repository
    @InjectRepository(Reciept)
    private receiptRepository: Repository<Reciept>,
    @InjectRepository(SubInventoriesCoffee)
    private subInventoriesCoffeeRepository: Repository<SubInventoriesCoffee>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    // subInventoriesRiceRepository
    @InjectRepository(SubInventoriesRice)
    private subInventoriesRiceRepository: Repository<SubInventoriesRice>,
  ) {}

  async findAll(): Promise<CateringEvent[]> {
    return this.cateringEventRepository.find({
      relations: ['meals', 'meals.mealProducts', 'user'],
    });
  }

  async findOne(id: number): Promise<CateringEvent> {
    const event = await this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: [
        'meals',
        'user',
        'meals.mealProducts',
        'meals.mealProducts.product',
        'meals.mealProducts.product.ingredient',
        'meals.mealProducts.product.productTypes',
      ],
    });
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }
    return event;
  }

  async create(cateringEventData: CreateCateringEventDto) {
    const cateringEvent = new CateringEvent();
    cateringEvent.eventName = cateringEventData.eventName;
    cateringEvent.eventDate = new Date(cateringEventData.eventDate);
    cateringEvent.status = cateringEventData.status || 'pending';
    cateringEvent.totalBudget = cateringEventData.totalBudget;
    cateringEvent.eventLocation = cateringEventData.eventLocation;
    cateringEvent.attendeeCount = cateringEventData.attendeeCount;

    // Find and associate user
    const user = await this.userRepository.findOne({
      where: { userId: cateringEventData.user.userId },
    });
    if (!user) throw new NotFoundException('User not found');
    cateringEvent.user = user;

    if (cateringEventData.riceReceiptId)
      cateringEvent.riceReceiptId = cateringEventData.riceReceiptId;
    if (cateringEventData.coffeeReceiptId)
      cateringEvent.coffeeReceiptId = cateringEventData.coffeeReceiptId;

    if (cateringEventData.meals) {
      // Step 1: Aggregate required quantities by ingredient ID across all meals
      const ingredientQuantities: {
        [ingredientId: number]: { quantity: number; type: string };
      } = {};

      for (const mealData of cateringEventData.meals) {
        for (const mealProductData of mealData.mealProducts) {
          const product = await this.productRepository.findOne({
            where: { productId: mealProductData.product.productId },
            relations: ['ingredient'],
          });
          if (!product && mealProductData.type !== 'เลี้ยงรับรอง')
            throw new NotFoundException('Product not found');

          if (
            mealProductData.type !== 'เลี้ยงรับรอง' &&
            product.needLinkIngredient &&
            product.ingredient
          ) {
            const ingredientId = product.ingredient.ingredientId;
            if (!ingredientQuantities[ingredientId]) {
              ingredientQuantities[ingredientId] = {
                quantity: 0,
                type: mealProductData.type,
              };
            }
            ingredientQuantities[ingredientId].quantity +=
              mealProductData.quantity;
          }
        }
      }

      // Step 2: Check inventory for each ingredient and reserve if sufficient
      for (const [ingredientId, { quantity, type }] of Object.entries(
        ingredientQuantities,
      )) {
        const ingredientIdNum = Number(ingredientId);
        let inventory;

        // Retrieve inventory based on the type (ร้านกาแฟ or ร้านข้าว)
        if (type === 'ร้านกาแฟ') {
          inventory = await this.subInventoriesCoffeeRepository.findOne({
            where: { ingredient: { ingredientId: ingredientIdNum } },
          });
          if (!inventory)
            throw new NotFoundException('Coffee inventory not found');
        } else if (type === 'ร้านข้าว') {
          inventory = await this.subInventoriesRiceRepository.findOne({
            where: { ingredient: { ingredientId: ingredientIdNum } },
          });
          if (!inventory)
            throw new NotFoundException('Rice inventory not found');
        }

        // Check if inventory is sufficient
        if (inventory.quantity - inventory.reservedQuantity < quantity) {
          throw new Error(
            `Insufficient ${type} inventory for ingredient ID ${ingredientId}`,
          );
        }

        // Reserve inventory if sufficient
        inventory.reservedQuantity += quantity;
        if (type === 'ร้านกาแฟ') {
          await this.subInventoriesCoffeeRepository.save(inventory);
        } else if (type === 'ร้านข้าว') {
          await this.subInventoriesRiceRepository.save(inventory);
        }
      }

      // Step 3: Save each meal and mealProduct once inventory is confirmed sufficient
      cateringEvent.meals = await Promise.all(
        cateringEventData.meals.map(async (mealData) => {
          const newMeal = new Meal();
          newMeal.mealName = mealData.mealName;
          newMeal.mealTime = mealData.mealTime;
          newMeal.description = mealData.description;
          newMeal.totalPrice = mealData.totalPrice;

          newMeal.mealProducts = await Promise.all(
            mealData.mealProducts.map(async (mealProductData) => {
              const mealProduct = new MealProduct();
              const product = await this.productRepository.findOne({
                where: { productId: mealProductData.product.productId },
              });

              mealProduct.product = product;
              mealProduct.productName = mealProductData.productName;
              mealProduct.productPrice = mealProductData.productPrice;
              mealProduct.quantity = mealProductData.quantity;
              mealProduct.totalPrice = mealProductData.totalPrice;
              mealProduct.type = mealProductData.type;

              return this.mealProductRepository.save(mealProduct);
            }),
          );

          return this.mealRepository.save(newMeal);
        }),
      );

      return this.cateringEventRepository.save(cateringEvent);
    } else {
      throw new NotFoundException('Meals not found');
    }
  }

  async update(
    id: number,
    updateData: Partial<CreateCateringEventDto>,
  ): Promise<CateringEvent> {
    const existingEvent = await this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: [
        'meals',
        'meals.mealProducts',
        'meals.mealProducts.product',
        'meals.mealProducts.product.ingredient',
      ],
    });

    if (!existingEvent) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }

    // Update event-level details
    existingEvent.eventName = updateData.eventName || existingEvent.eventName;
    existingEvent.eventDate = updateData.eventDate || existingEvent.eventDate;
    existingEvent.eventLocation =
      updateData.eventLocation || existingEvent.eventLocation;
    existingEvent.attendeeCount =
      updateData.attendeeCount || existingEvent.attendeeCount;
    existingEvent.status = updateData.status || existingEvent.status;

    // Step 1: Release old inventory
    const oldIngredientQuantities = this.aggregateIngredientQuantities(
      existingEvent.meals,
    );

    for (const [ingredientId, { quantity, type }] of Object.entries(
      oldIngredientQuantities,
    )) {
      await this.adjustInventory(Number(ingredientId), -quantity, type);
    }

    // Step 2: Identify meals to remove
    const updatedMealNames = new Set(
      (updateData.meals || []).map((meal) => meal.mealName),
    );
    const mealsToRemove = existingEvent.meals.filter(
      (meal) => !updatedMealNames.has(meal.mealName),
    );

    // Remove meals and their associated mealProducts
    for (const meal of mealsToRemove) {
      await this.mealProductRepository.delete({
        meal: { mealId: meal.mealId },
      });
      await this.mealRepository.delete(meal.mealId);
    }

    // Step 3: Handle updated and new meals/products
    existingEvent.meals = await Promise.all(
      (updateData.meals || []).map(async (mealData) => {
        const existingMeal = existingEvent.meals.find(
          (meal) => meal.mealName === mealData.mealName,
        );
        const meal = existingMeal || new Meal();

        meal.mealName = mealData.mealName;
        meal.mealTime = mealData.mealTime;
        meal.description = mealData.description;

        meal.mealProducts = meal.mealProducts || [];

        // Update or add mealProducts
        meal.mealProducts = await Promise.all(
          mealData.mealProducts.map(async (mealProductData) => {
            const existingMealProduct = meal.mealProducts.find(
              (mp) =>
                mp.product?.productId === mealProductData.product?.productId,
            );
            const mealProduct = existingMealProduct || new MealProduct();

            if (mealProductData.type === 'เลี้ยงรับรอง') {
              mealProduct.product = null;
            } else {
              const product = await this.productRepository.findOne({
                where: { productId: mealProductData.product.productId },
              });

              mealProduct.product = product;
            }

            mealProduct.productName = mealProductData.productName;
            mealProduct.productPrice = mealProductData.productPrice || 0; // Default to 0
            mealProduct.quantity = mealProductData.quantity || 0; // Default to 0
            mealProduct.totalPrice =
              (mealProductData.quantity || 0) *
              (mealProductData.productPrice || 0);

            return this.mealProductRepository.save(mealProduct);
          }),
        );

        meal.totalPrice =
          mealData.totalPrice ||
          meal.mealProducts.reduce((sum, mp) => sum + (mp.totalPrice || 0), 0);

        return this.mealRepository.save(meal);
      }),
    );

    // Step 4: Recalculate total budget dynamically
    existingEvent.totalBudget = existingEvent.meals.reduce(
      (sum, meal) => sum + (meal.totalPrice || 0),
      0,
    );

    return this.cateringEventRepository.save(existingEvent);
  }

  private aggregateIngredientQuantities(meals: Meal[]): {
    [ingredientId: number]: { quantity: number; type: string };
  } {
    const ingredientQuantities: {
      [ingredientId: number]: { quantity: number; type: string };
    } = {};

    meals.forEach((meal) => {
      meal.mealProducts.forEach((mealProduct) => {
        const product = mealProduct.product;
        if (product && product.ingredient && product.needLinkIngredient) {
          const ingredientId = product.ingredient.ingredientId;
          if (!ingredientQuantities[ingredientId]) {
            ingredientQuantities[ingredientId] = {
              quantity: 0,
              type: mealProduct.type,
            };
          }
          ingredientQuantities[ingredientId].quantity += mealProduct.quantity;
        }
      });
    });

    return ingredientQuantities;
  }

  private async adjustInventory(
    ingredientId: number,
    quantity: number,
    type: string,
    reserve = false,
  ): Promise<void> {
    let inventory;
    if (type === 'เลี้ยงรับรอง') return;
    if (type === 'ร้านกาแฟ') {
      inventory = await this.subInventoriesCoffeeRepository.findOne({
        where: { ingredient: { ingredientId } },
      });
      if (!inventory) throw new NotFoundException('Coffee inventory not found');
    } else if (type === 'ร้านข้าว') {
      inventory = await this.subInventoriesRiceRepository.findOne({
        where: { ingredient: { ingredientId } },
      });
      if (!inventory) throw new NotFoundException('Rice inventory not found');
    }

    if (reserve) {
      if (inventory.quantity - inventory.reservedQuantity < quantity) {
        throw new Error(
          `Insufficient ${type} inventory for ingredient ID ${ingredientId}`,
        );
      }
      inventory.reservedQuantity += quantity;
    } else {
      inventory.reservedQuantity += quantity;
    }

    if (type === 'ร้านกาแฟ') {
      await this.subInventoriesCoffeeRepository.save(inventory);
    } else if (type === 'ร้านข้าว') {
      await this.subInventoriesRiceRepository.save(inventory);
    }
  }

  async updateStatus(id: number, status: string): Promise<CateringEvent> {
    // Ensure all necessary relationships are loaded
    const event = await this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: [
        'meals',
        'meals.mealProducts',
        'meals.mealProducts.product',
        'meals.mealProducts.product.ingredient',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }

    // Perform inventory updates based on status change
    if (event.meals) {
      for (const meal of event.meals) {
        for (const mealProduct of meal.mealProducts) {
          if (mealProduct.product && mealProduct.product.needLinkIngredient) {
            const ingredientId = mealProduct.product.ingredient?.ingredientId;
            if (ingredientId) {
              let inventory;

              if (mealProduct.product.storeType === 'ร้านกาแฟ') {
                inventory = await this.subInventoriesCoffeeRepository.findOne({
                  where: { ingredient: { ingredientId } },
                });
                if (!inventory)
                  throw new NotFoundException('Coffee inventory not found');
              } else if (mealProduct.product.storeType === 'ร้านข้าว') {
                inventory = await this.subInventoriesRiceRepository.findOne({
                  where: { ingredient: { ingredientId } },
                });
                if (!inventory)
                  throw new NotFoundException('Rice inventory not found');
              }
              console.log('status', status);

              if (inventory) {
                if (status === 'paid') {
                  // On success, deduct quantity and reserved quantity if sufficient reserve exists
                  if (inventory.reservedQuantity >= mealProduct.quantity) {
                    inventory.quantity -= mealProduct.quantity;
                    inventory.reservedQuantity -= mealProduct.quantity;
                  } else {
                    throw new Error(
                      `Insufficient reserved quantity for ${mealProduct.product.storeType}`,
                    );
                  }
                }
                if (status === 'canceled') {
                  inventory.quantity += mealProduct.quantity;
                  inventory.reservedQuantity -= mealProduct.quantity;
                }
                await (mealProduct.product.storeType === 'ร้านกาแฟ'
                  ? this.subInventoriesCoffeeRepository
                  : this.subInventoriesRiceRepository
                ).save(inventory);
              }
            }
          }
        }
      }
    }

    // Update the status of the event
    event.status = status;
    return this.cateringEventRepository.save(event);
  }

  async delete(id: number): Promise<void> {
    await this.cateringEventRepository.delete(id);
  }

  async paginate(page = 1, limit = 10) {
    const event = await this.cateringEventRepository.findAndCount({
      take: limit,
      skip: limit * (page - 1),
      relations: [
        'user',
        'meals',
        'meals.mealProducts',
        'meals.mealProducts.product',
      ],
      order: { createdDate: 'DESC' },
    });
    return {
      data: event[0],
      meta: {
        total: event[1],
        page: page,
        last_page: Math.ceil(event[1] / limit),
      },
    };
  }

  async cancel(id: number): Promise<CateringEvent> {
    // Load the event with all necessary relationships
    const event = await this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: [
        'meals',
        'meals.mealProducts',
        'meals.mealProducts.product',
        'meals.mealProducts.product.ingredient',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }

    // Set event status to "canceled"
    event.status = 'canceled';

    // Update inventory for each meal product
    if (event.meals) {
      for (const meal of event.meals) {
        for (const mealProduct of meal.mealProducts) {
          if (mealProduct.product && mealProduct.product.needLinkIngredient) {
            const ingredientId = mealProduct.product.ingredient?.ingredientId;
            if (ingredientId) {
              let inventory;

              if (mealProduct.product.storeType === 'ร้านกาแฟ') {
                inventory = await this.subInventoriesCoffeeRepository.findOne({
                  where: { ingredient: { ingredientId } },
                });
                if (!inventory)
                  throw new NotFoundException('Coffee inventory not found');
              } else if (mealProduct.product.storeType === 'ร้านข้าว') {
                inventory = await this.subInventoriesRiceRepository.findOne({
                  where: { ingredient: { ingredientId } },
                });
                if (!inventory)
                  throw new NotFoundException('Rice inventory not found');
              }

              if (inventory) {
                // Adjust inventory for "canceled" status
                inventory.quantity += mealProduct.quantity;
                inventory.reservedQuantity -= mealProduct.quantity;
                await (mealProduct.product.storeType === 'ร้านกาแฟ'
                  ? this.subInventoriesCoffeeRepository
                  : this.subInventoriesRiceRepository
                ).save(inventory);
              }
            }
          }
        }
      }
    }

    // Update related receipts to "canceled" status
    const receiptRice = await this.receiptRepository.findOne({
      where: { receiptId: event.riceReceiptId },
    });
    if (receiptRice) {
      receiptRice.receiptStatus = 'canceled';
      await this.receiptRepository.save(receiptRice);
    }

    const receiptCoffee = await this.receiptRepository.findOne({
      where: { receiptId: event.coffeeReceiptId },
    });
    if (receiptCoffee) {
      receiptCoffee.receiptStatus = 'canceled';
      await this.receiptRepository.save(receiptCoffee);
    }

    // Save and return the updated event with the "canceled" status
    return this.cateringEventRepository.save(event);
  }
}
