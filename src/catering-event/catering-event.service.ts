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
      relations: ['meals', 'user'],
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
      cateringEvent.meals = await Promise.all(
        cateringEventData.meals.map(async (mealData: Meal) => {
          const newMeal = new Meal();
          newMeal.mealName = mealData.mealName;
          newMeal.mealTime = mealData.mealTime;
          newMeal.description = mealData.description;
          newMeal.totalPrice = mealData.totalPrice;

          newMeal.mealProducts = await Promise.all(
            mealData.mealProducts.map(async (mealProductData: MealProduct) => {
              const mealProduct = new MealProduct();

              // Fetch and validate product
              const product = await this.productRepository.findOne({
                where: { productId: mealProductData.product.productId },
                relations: ['ingredient'],
              });
              if (!product && mealProductData.type != 'เลี้ยงรับรอง')
                throw new NotFoundException('Product not found');

              // Check and reserve inventory if product has linked ingredient
              if (
                mealProductData.type != 'เลี้ยงรับรอง' &&
                product.needLinkIngredient &&
                product.ingredient
              ) {
                const ingredientId_ = product.ingredient.ingredientId;
                console.log('ingredientId_', ingredientId_);

                let inventory;
                if (mealProductData.type === 'ร้านกาแฟ') {
                  inventory = await this.subInventoriesCoffeeRepository.findOne(
                    {
                      where: { ingredient: { ingredientId: ingredientId_ } },
                    },
                  );
                  if (!inventory)
                    throw new NotFoundException('Coffee inventory not found');
                } else if (mealProductData.type === 'ร้านข้าว') {
                  console.log('rice', ingredientId_);

                  inventory = await this.subInventoriesRiceRepository.findOne({
                    where: { ingredient: { ingredientId: ingredientId_ } },
                  });

                  if (!inventory)
                    throw new NotFoundException('Rice inventory not found');
                  console.log('rice', inventory);
                }

                if (
                  inventory.quantity - inventory.reservedQuantity <
                  mealProductData.quantity
                ) {
                  throw new Error(
                    `Insufficient ${mealProductData.type} inventory`,
                  );
                }

                // Reserve inventory quantity
                inventory.reservedQuantity += mealProductData.quantity;
                if (mealProductData.type === 'ร้านกาแฟ') {
                  await this.subInventoriesCoffeeRepository.save(inventory);
                }
                if (mealProductData.type === 'ร้านข้าว') {
                  await this.subInventoriesRiceRepository.save(inventory);
                }
              }

              // Set meal product properties
              mealProduct.product = product;
              if (mealProductData.type === 'เลี้ยงรับรอง') {
                mealProduct.productName = mealProductData.productName;
              } else {
                mealProduct.productName =
                  product.productName || mealProductData.productName;
              }

              mealProduct.price = mealProductData.price;
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
    updateData: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }

    Object.assign(event, updateData);
    return this.cateringEventRepository.save(event);
  }

  async updateStatus(id: number, status: string): Promise<CateringEvent> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }
    event.status = status;
    // ujpdate quantity reserved in sub inventory
    if (event.meals) {
      event.meals.forEach(async (meal) => {
        meal.mealProducts.forEach(async (mealProduct) => {
          if (mealProduct.product.needLinkIngredient) {
            if (mealProduct.product.storeType === 'coffee') {
              const ingredient = await this.ingredientRepository.findOne({
                where: {
                  ingredientId: mealProduct.product.ingredient.ingredientId,
                },
              });

              if (!ingredient) {
                throw new NotFoundException('Ingredient not found');
              }

              const coffeeInventory =
                await this.subInventoriesCoffeeRepository.findOne({
                  where: { ingredient },
                });

              if (!coffeeInventory) {
                throw new NotFoundException('Coffee inventory not found');
              }

              coffeeInventory.reservedQuantity -= mealProduct.quantity;
              await this.subInventoriesCoffeeRepository.save(coffeeInventory);
            }
            if (mealProduct.product.storeType === 'rice') {
              const ingredient = await this.ingredientRepository.findOne({
                where: {
                  ingredientId: mealProduct.product.ingredient.ingredientId,
                },
              });

              if (!ingredient) {
                throw new NotFoundException('Ingredient not found');
              }

              const coffeeInventory =
                await this.subInventoriesCoffeeRepository.findOne({
                  where: { ingredient },
                });

              if (!coffeeInventory) {
                throw new NotFoundException('Coffee inventory not found');
              }

              coffeeInventory.reservedQuantity -= mealProduct.quantity;
              await this.subInventoriesCoffeeRepository.save(coffeeInventory);
            }
          }
        });
      });
    }
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

  // cancel
  async cancel(id: number): Promise<CateringEvent> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }
    event.status = 'canceled';
    // find receipt and update status
    const receiptRice = await this.receiptRepository.findOne({
      where: { receiptId: event.riceReceiptId },
    });
    if (receiptRice) {
      receiptRice.receiptStatus = 'cancel';
      await this.productRepository.save(receiptRice);
    }
    const receiptCoffee = await this.receiptRepository.findOne({
      where: { receiptId: event.coffeeReceiptId },
    });
    if (receiptCoffee) {
      receiptCoffee.receiptStatus = 'cancel';
      await this.productRepository.save(receiptCoffee);
    }

    return this.cateringEventRepository.save(event);
  }
}
