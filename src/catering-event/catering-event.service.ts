import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { UpdateCateringEventDto } from './dto/update-catering-event.dto';

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
    // recieptRepository
    @InjectRepository(Reciept)
    private recieptRepository: Repository<Reciept>,
  ) {}

  async findAll(): Promise<CateringEvent[]> {
    return this.cateringEventRepository.find({
      relations: ['meals', 'meals.mealProducts', 'user'],
    });
  }
  async getMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const events = await this.cateringEventRepository
      .createQueryBuilder('event')
      .where('event.eventDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    const totalEvents = events.length;

    const pendingEvents = events.filter(
      (event) => event.status === 'pending',
    ).length;

    const completedEvents = events.filter(
      (event) => event.status === 'paid',
    ).length;

    const totalProfit = events
      .filter((event) => event.status === 'paid')
      .reduce((sum, event) => sum + event.totalBudget, 0);

    return {
      month,
      year,
      totalEvents,
      pendingEvents,
      completedEvents,
      totalProfit,
    };
  }

  async findOne(id: number): Promise<CateringEvent> {
    const event = await this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: [
        'meals',
        'user',
        'meals.mealProducts',
        'meals.mealProducts.product.productTypes',
        'meals.mealProducts.receiptItems',
        'meals.coffeeReceipt.receiptItems.product.productTypes',
        'meals.coffeeReceipt.receiptItems.productType',
        'meals.coffeeReceipt.receiptItems.productTypeToppings.productType',
        'meals.coffeeReceipt.receiptItems.productTypeToppings.topping',
        'meals.riceReceipt.receiptItems.product',
      ],
    });
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }
    return event;
  }

  async create(cateringEventData: CreateCateringEventDto) {
    try {
      // Step 1: Initialize Catering Event
      const cateringEvent = new CateringEvent();
      cateringEvent.eventName = cateringEventData.eventName;
      cateringEvent.eventDate = new Date(cateringEventData.eventDate);
      cateringEvent.eventLocation = cateringEventData.eventLocation;
      cateringEvent.attendeeCount = cateringEventData.attendeeCount;
      cateringEvent.totalBudget = cateringEventData.totalBudget;
      cateringEvent.status = cateringEventData.status || 'pending';

      // Link the user
      const user = await this.userRepository.findOne({
        where: { userId: cateringEventData.user.userId },
      });
      if (!user) throw new NotFoundException('User not found');
      cateringEvent.user = user;

      // Step 2: Process Meals and Link Receipts
      const meals = await Promise.all(
        cateringEventData.mealDto.map(async (mealData) => {
          const meal = new Meal();
          meal.mealName = mealData.mealName;
          meal.mealTime = mealData.mealTime;
          meal.description = mealData.description;
          meal.totalPrice = mealData.totalPrice;

          const ingredientQuantities: {
            [ingredientId: number]: { quantity: number; type: string };
          } = {};

          // Process Meal Products
          meal.mealProducts = await Promise.all(
            mealData.mealProducts.map(async (mealProductData) => {
              const mealProduct = new MealProduct();
              console.log('mealProductData', mealProductData);

              if (mealProductData.type === 'เลี้ยงรับรอง') {
                mealProduct.product = null;
                mealProduct.productName = mealProductData.productName;
                mealProduct.productPrice = mealProductData.productPrice;
                mealProduct.quantity = mealProductData.quantity;
                mealProduct.totalPrice = mealProductData.totalPrice;
                mealProduct.type = mealProductData.type;
              }
              if (
                mealProductData.type === 'ร้านกาแฟ' ||
                mealProductData.type === 'ร้านข้าว'
              ) {
                // Link product
                const product = await this.productRepository.findOne({
                  where: { productId: mealProductData.product.productId },
                  relations: ['ingredient', 'productTypes'],
                });
                if (!product)
                  throw new NotFoundException(
                    'Product not found for mealProduct',
                  );
                console.log('product', product);

                mealProduct.product = product;
                mealProduct.receiptItems = mealProductData.receiptItems;
                mealProduct.quantity = mealProductData.quantity;
                mealProduct.productName = product.productName;
                mealProduct.totalPrice = mealProductData.totalPrice;
                mealProduct.type = mealProductData.type;
                // Add product ingredient quantity
                if (product.ingredient) {
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

              return this.mealProductRepository.save(mealProduct);
            }),
          );

          // Validate and Reserve Ingredient Quantities
          for (const [ingredientId, { quantity, type }] of Object.entries(
            ingredientQuantities,
          )) {
            const ingredientIdNum = Number(ingredientId);
            let inventory;

            // Retrieve inventory based on type
            if (type === 'ร้านกาแฟ') {
              inventory = await this.subInventoriesCoffeeRepository.findOne({
                where: { ingredient: { ingredientId: ingredientIdNum } },
              });
              if (!inventory)
                throw new NotFoundException(
                  `Coffee inventory not found for ingredient ID ${ingredientIdNum}`,
                );
            } else if (type === 'ร้านข้าว') {
              inventory = await this.subInventoriesRiceRepository.findOne({
                where: { ingredient: { ingredientId: ingredientIdNum } },
              });
              if (!inventory)
                throw new NotFoundException(
                  `Rice inventory not found for ingredient ID ${ingredientIdNum}`,
                );
            }

            // Check inventory sufficiency
            if (inventory.quantity - inventory.reservedQuantity < quantity) {
              throw new Error(
                `Insufficient ${type} inventory for ingredient ID ${ingredientIdNum}`,
              );
            }

            // Reserve inventory
            inventory.reservedQuantity += quantity;
            if (type === 'ร้านกาแฟ') {
              await this.subInventoriesCoffeeRepository.save(inventory);
            } else if (type === 'ร้านข้าว') {
              await this.subInventoriesRiceRepository.save(inventory);
            }
          }

          // Link receipts to the meal if provided
          if (mealData.riceReceiptId) {
            const riceReceipt = await this.recieptRepository.findOne({
              where: { receiptId: mealData.riceReceiptId },
              relations: ['receiptItems'],
            });
            if (!riceReceipt)
              throw new NotFoundException('Rice receipt not found');
            meal.riceReceipt = riceReceipt;
          }

          if (mealData.coffeeReceiptId) {
            const coffeeReceipt = await this.recieptRepository.findOne({
              where: { receiptId: mealData.coffeeReceiptId },
              relations: ['receiptItems'],
            });
            if (!coffeeReceipt)
              throw new NotFoundException('Coffee receipt not found');
            meal.coffeeReceipt = coffeeReceipt;
          }

          return this.mealRepository.save(meal);
        }),
      );

      // Step 3: Link Meals to Catering Event
      cateringEvent.meals = meals;

      // Save the Catering Event
      const savedCateringEvent = await this.cateringEventRepository.save(
        cateringEvent,
      );

      // Step 4: Avoid Circular References in the Response
      const { meals: _, ...result } = savedCateringEvent;
      return result;
    } catch (error) {
      console.error('Error creating catering event:', error);
      throw new InternalServerErrorException('Failed to create catering event');
    }
  }

  async update(id: number, updateData: UpdateCateringEventDto): Promise<any> {
    try {
      // Fetch the old catering event with related meals and products
      const oldEvent = await this.cateringEventRepository.findOne({
        where: { eventId: id },
        relations: [
          'meals',
          'meals.mealProducts',
          'meals.mealProducts.product',
          'meals.mealProducts.product.ingredient',
        ],
      });

      if (!oldEvent) {
        throw new NotFoundException(`Catering event with id ${id} not found`);
      }

      console.log('Incoming updateData:', JSON.stringify(updateData, null, 2));

      // Compare meals and mealProducts
      for (const oldMeal of oldEvent.meals) {
        const newMeal = updateData.meals.find(
          (meal: Meal) => meal.mealId === oldMeal.mealId,
        );

        if (!newMeal) {
          // Remove old mealProducts if meal is not present in updateData
          for (const oldMealProduct of oldMeal.mealProducts) {
            if (oldMealProduct.product?.ingredient) {
              const ingredientId =
                oldMealProduct.product.ingredient.ingredientId;
              console.log(
                `Releasing inventory for ingredient ID: ${ingredientId}`,
              );
              await this.adjustInventory(
                ingredientId,
                -oldMealProduct.quantity,
                oldMealProduct.type,
                true,
              );
            }
          }
          continue; // Skip further processing for this meal
        }

        // Compare mealProducts within the meal
        const oldMealProductsMap = new Map(
          oldMeal.mealProducts.map((p) => [p.mealProductId, p]),
        );

        for (const newMealProduct of newMeal.mealProducts) {
          const oldMealProduct = oldMealProductsMap.get(
            newMealProduct.mealProductId,
          );

          if (!oldMealProduct) {
            // New mealProduct added
            if (newMealProduct.product?.ingredient) {
              const ingredientId =
                newMealProduct.product.ingredient.ingredientId;
              console.log(
                `Reserving inventory for new ingredient ID: ${ingredientId}`,
              );
              await this.adjustInventory(
                ingredientId,
                newMealProduct.quantity,
                newMealProduct.type,
                true,
              );
            }
          } else {
            // Existing mealProduct: Check for quantity changes
            const quantityDifference =
              newMealProduct.quantity - oldMealProduct.quantity;

            if (
              quantityDifference !== 0 &&
              oldMealProduct.product?.ingredient
            ) {
              const ingredientId =
                oldMealProduct.product.ingredient.ingredientId;
              console.log(
                `Adjusting inventory for ingredient ID: ${ingredientId}, Quantity Difference: ${quantityDifference}`,
              );
              await this.adjustInventory(
                ingredientId,
                quantityDifference,
                oldMealProduct.type,
                true,
              );
            }

            // Update mealProduct details
            oldMealProduct.quantity = newMealProduct.quantity;
            oldMealProduct.totalPrice =
              newMealProduct.productPrice * newMealProduct.quantity;

            // Save updated mealProduct
            const savedMealProduct = await this.mealProductRepository.save(
              oldMealProduct,
            );
            console.log('Updated MealProduct:', savedMealProduct);

            oldMealProductsMap.delete(newMealProduct.mealProductId);
          }
        }

        // Handle leftover old products (removed in the new data)
        for (const [
          mealProductId,
          oldMealProduct,
        ] of oldMealProductsMap.entries()) {
          if (oldMealProduct.product?.ingredient) {
            const ingredientId = oldMealProduct.product.ingredient.ingredientId;
            console.log(
              `Releasing inventory for removed ingredient ID: ${ingredientId}`,
            );
            await this.adjustInventory(
              ingredientId,
              -oldMealProduct.quantity,
              oldMealProduct.type,
              true,
            );
          }
          await this.mealProductRepository.remove(oldMealProduct);
        }
      }

      // Update event details
      oldEvent.eventName = updateData.eventName || oldEvent.eventName;
      oldEvent.eventDate = updateData.eventDate || oldEvent.eventDate;
      oldEvent.eventLocation =
        updateData.eventLocation || oldEvent.eventLocation;
      oldEvent.attendeeCount =
        updateData.attendeeCount || oldEvent.attendeeCount;
      oldEvent.status = updateData.status || oldEvent.status;

      // Save updated meals and mealProducts
      oldEvent.meals = await Promise.all(
        updateData.meals.map(async (meal: Meal) => {
          const existingMeal =
            oldEvent.meals.find((m) => m.mealId === meal.mealId) || new Meal();
          existingMeal.mealName = meal.mealName;
          existingMeal.mealTime = meal.mealTime;
          existingMeal.description = meal.description;
          existingMeal.totalPrice = meal.totalPrice;

          existingMeal.mealProducts = await Promise.all(
            meal.mealProducts.map(async (mealProduct: any) => {
              const existingProduct =
                existingMeal.mealProducts.find(
                  (p) => p.mealProductId === mealProduct.mealProductId,
                ) || new MealProduct();

              existingProduct.productName = mealProduct.productName;
              existingProduct.productPrice = mealProduct.productPrice;
              existingProduct.quantity = mealProduct.quantity;
              existingProduct.totalPrice =
                mealProduct.productPrice * mealProduct.quantity;
              existingProduct.type = mealProduct.type;

              if (mealProduct.product) {
                const product = await this.productRepository.findOne({
                  where: { productId: mealProduct.product.productId },
                  relations: ['ingredient'],
                });
                if (product) existingProduct.product = product;
              }

              const savedProduct = await this.mealProductRepository.save(
                existingProduct,
              );

              console.log('Saved MealProduct:', savedProduct);
              return savedProduct;
            }),
          );

          return this.mealRepository.save(existingMeal);
        }),
      );

      // Recalculate total budget
      oldEvent.totalBudget = oldEvent.meals.reduce(
        (sum, meal) => sum + meal.totalPrice,
        0,
      );

      const savedEvent = await this.cateringEventRepository.save(oldEvent);
      console.log('Updated Catering Event:', savedEvent);
      return savedEvent;
    } catch (error) {
      console.error('Error updating catering event:', error);
      throw new InternalServerErrorException('Failed to update catering event');
    }
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
          console.log(
            `Aggregating ingredient ID ${ingredientId}: Quantity ${mealProduct.quantity}, Type: ${mealProduct.type}`,
          );
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
      // Reserve inventory
      if (quantity > 0) {
        if (inventory.quantity - inventory.reservedQuantity < quantity) {
          throw new Error(
            `Insufficient ${type} inventory for ingredient ID ${ingredientId}. Available: ${
              inventory.quantity - inventory.reservedQuantity
            }, Requested: ${quantity}`,
          );
        }
        inventory.reservedQuantity += quantity;
        inventory.quantity -= quantity;
        console.log(
          `Reserved ${quantity} of ingredient ID ${ingredientId} for ${type}. Remaining quantity: ${inventory.quantity}, Reserved: ${inventory.reservedQuantity}`,
        );
      } else {
        const reserveReduction = Math.abs(quantity);
        if (inventory.reservedQuantity < reserveReduction) {
          throw new Error(
            `Cannot release more reserved quantity than available for ingredient ID ${ingredientId}. Reserved: ${inventory.reservedQuantity}, Requested to release: ${reserveReduction}`,
          );
        }
        inventory.reservedQuantity -= reserveReduction;
        inventory.quantity += reserveReduction;
        console.log(
          `Released ${reserveReduction} of ingredient ID ${ingredientId} for ${type}. Remaining quantity: ${inventory.quantity}, Reserved: ${inventory.reservedQuantity}`,
        );
      }
    } else {
      // Adjust inventory directly
      inventory.quantity += quantity;
      inventory.reservedQuantity -= quantity;
      if (inventory.quantity < 0) {
        throw new Error(
          `Inventory for ingredient ID ${ingredientId} cannot be negative. Current quantity: ${inventory.quantity}`,
        );
      }
      console.log(
        `Adjusted inventory for ingredient ID ${ingredientId} by ${quantity} for ${type}. Current quantity: ${inventory.quantity}, Reserved: ${inventory.reservedQuantity}`,
      );
    }

    if (type === 'ร้านกาแฟ') {
      await this.subInventoriesCoffeeRepository.save(inventory);
    } else if (type === 'ร้านข้าว') {
      await this.subInventoriesRiceRepository.save(inventory);
    }
  }

  async updateStatus(id: number, status: string): Promise<CateringEvent> {
    try {
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
                  inventory = await this.subInventoriesCoffeeRepository.findOne(
                    {
                      where: { ingredient: { ingredientId } },
                    },
                  );
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
    } catch (error) {
      console.error('Error updating catering event status:', error);
      throw new InternalServerErrorException(
        'Failed to update catering event status',
      );
    }
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

  //   async cancel(id: number): Promise<CateringEvent> {
  //     // Load the event with all necessary relationships
  //     const event = await this.cateringEventRepository.findOne({
  //       where: { eventId: id },
  //       relations: [
  //         'meals',
  //         'meals.mealProducts',
  //         'meals.mealProducts.product',
  //         'meals.mealProducts.product.ingredient',
  //       ],
  //     });

  //     if (!event) {
  //       throw new NotFoundException(`Catering event with id ${id} not found`);
  //     }

  //     // Set event status to "canceled"
  //     event.status = 'canceled';

  //     // Update inventory for each meal product
  //     if (event.meals) {
  //       for (const meal of event.meals) {
  //         for (const mealProduct of meal.mealProducts) {
  //           if (mealProduct.product && mealProduct.product.needLinkIngredient) {
  //             const ingredientId = mealProduct.product.ingredient?.ingredientId;
  //             if (ingredientId) {
  //               let inventory;

  //               if (mealProduct.product.storeType === 'ร้านกาแฟ') {
  //                 inventory = await this.subInventoriesCoffeeRepository.findOne({
  //                   where: { ingredient: { ingredientId } },
  //                 });
  //                 if (!inventory)
  //                   throw new NotFoundException('Coffee inventory not found');
  //               } else if (mealProduct.product.storeType === 'ร้านข้าว') {
  //                 inventory = await this.subInventoriesRiceRepository.findOne({
  //                   where: { ingredient: { ingredientId } },
  //                 });
  //                 if (!inventory)
  //                   throw new NotFoundException('Rice inventory not found');
  //               }

  //               if (inventory) {
  //                 // Adjust inventory for "canceled" status
  //                 inventory.quantity += mealProduct.quantity;
  //                 inventory.reservedQuantity -= mealProduct.quantity;
  //                 await (mealProduct.product.storeType === 'ร้านกาแฟ'
  //                   ? this.subInventoriesCoffeeRepository
  //                   : this.subInventoriesRiceRepository
  //                 ).save(inventory);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }

  //     // Update related receipts to "canceled" status
  //     const receiptRice = await this.receiptRepository.findOne({
  //       where: { receiptId: event.riceReceiptId },
  //     });
  //     if (receiptRice) {
  //       receiptRice.receiptStatus = 'canceled';
  //       await this.receiptRepository.save(receiptRice);
  //     }

  //     const receiptCoffee = await this.receiptRepository.findOne({
  //       where: { receiptId: event.coffeeReceiptId },
  //     });
  //     if (receiptCoffee) {
  //       receiptCoffee.receiptStatus = 'canceled';
  //       await this.receiptRepository.save(receiptCoffee);
  //     }

  //     // Save and return the updated event with the "canceled" status
  //     return this.cateringEventRepository.save(event);
  //   }
}
