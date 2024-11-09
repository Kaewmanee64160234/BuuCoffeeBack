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
    cateringEvent.status = 'pending'; // pending, approved, rejected
    cateringEvent.totalBudget = cateringEventData.totalBudget;

    // Find user
    const user = await this.userRepository.findOne({
      where: { userId: cateringEventData.user.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    cateringEvent.user = user;
    cateringEvent.status = cateringEventData.status;
    cateringEvent.eventLocation = cateringEventData.eventLocation;
    cateringEvent.attendeeCount = cateringEventData.attendeeCount;
    cateringEvent.totalBudget = cateringEventData.totalBudget;
    if (cateringEventData.riceReceiptId) {
      cateringEvent.riceReceiptId = cateringEventData.riceReceiptId;
    }
    if (cateringEventData.coffeeReceiptId) {
      cateringEvent.coffeeReceiptId = cateringEventData.coffeeReceiptId;
    }
    if (cateringEventData.coffeeReceiptId) {
      cateringEvent.coffeeReceiptId = cateringEventData.coffeeReceiptId;

      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: cateringEventData.coffeeReceiptId },
      });

      if (!ingredient) {
        throw new NotFoundException('Ingredient not found');
      }

      const coffeeInventory = await this.subInventoriesCoffeeRepository.findOne(
        {
          where: { ingredient },
        },
      );

      if (!coffeeInventory) {
        throw new NotFoundException('Coffee inventory not found');
      }

      if (coffeeInventory.quantity - coffeeInventory.reservedQuantity < 2) {
        throw new Error('Insufficient coffee inventory');
      }

      coffeeInventory.reservedQuantity += 2;
      await this.subInventoriesCoffeeRepository.save(coffeeInventory);
    }

    if (cateringEventData.meals) {
      const meals = await Promise.all(
        cateringEventData.meals.map(async (mealData: Meal) => {
          const newMeal = new Meal();
          newMeal.mealName = mealData.mealName;
          newMeal.mealTime = mealData.mealTime;
          newMeal.totalPrice = mealData.totalPrice;

          newMeal.mealProducts = await Promise.all(
            mealData.mealProducts.map(async (mealProductData: MealProduct) => {
              const mealProduct = new MealProduct();

              const product = await this.productRepository.findOne({
                where: { productId: mealProductData.product.productId },
              });
              if (!product) {
                console.log('Product not found');
                console.log(mealProductData);

                mealProduct.productName = mealProductData.productName;
                mealProduct.price = mealProductData.price;
                mealProduct.product = null;
              } else {
                mealProduct.product = product;
              }

              mealProduct.quantity = mealProductData.quantity;
              mealProduct.totalPrice = mealProductData.totalPrice;
              mealProduct.type = mealProductData.type;

              const mealProductSaved = await this.mealProductRepository.save(
                mealProduct,
              );
              console.log(mealProductSaved);

              return mealProductSaved;
            }),
          );

          const mealSaved = await this.mealRepository.save(newMeal);
          console.log(mealSaved);

          return mealSaved;
        }),
      );
      console.log('----------------------------------');
      console.log(meals);

      cateringEvent.meals = meals;
      // Save the catering event with its meals and linked meal products

      const eventCateringSaved = await this.cateringEventRepository.save(
        cateringEvent,
      );

      return eventCateringSaved;
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
