import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reciept } from './entities/reciept.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Repository, getConnection, Between } from 'typeorm';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';

@Injectable()
export class RecieptService {
  private readonly logger = new Logger(RecieptService.name);
  constructor(
    @InjectRepository(Reciept)
    private recieptRepository: Repository<Reciept>,
    @InjectRepository(ReceiptItem)
    private recieptItemRepository: Repository<ReceiptItem>,
    @InjectRepository(ProductTypeTopping)
    private productTypeToppingRepository: Repository<ProductTypeTopping>,
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(ReceiptPromotion)
    private recieptPromotionRepository: Repository<ReceiptPromotion>,
  ) {}

  async create(createRecieptDto: CreateRecieptDto) {
    console.log(createRecieptDto);
    try {
      const user = await this.userRepository.findOne({
        where: { userId: createRecieptDto.userId },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const customer = createRecieptDto.customer
        ? await this.customerRepository.findOne({
            where: { customerId: createRecieptDto.customer.customerId },
          })
        : null;
      if (createRecieptDto.customer && !customer) {
        throw new Error('Customer not found');
      }
      if (customer !== null) {
        customer.customerNumberOfStamp += createRecieptDto.receiptItems.reduce(
          (acc, item) => item.quantity + acc,
          0,
        );
        await this.customerRepository.save(customer);
      }

      const newReciept = this.recieptRepository.create({
        receiptTotalPrice: createRecieptDto.receiptTotalPrice,
        receiptTotalDiscount: createRecieptDto.receiptTotalDiscount,
        receiptNetPrice: createRecieptDto.receiptNetPrice,
        receiptStatus: createRecieptDto.receiptStatus,
        user: user,
        customer: customer,
        receiptType: createRecieptDto.receiptType,
        paymentMethod: createRecieptDto.paymentMethod,
      });

      const recieptSave = await this.recieptRepository.save(newReciept);

      for (const receiptItemDto of createRecieptDto.receiptItems) {
        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity <= 0) {
          throw new Error('Invalid quantity value');
        }

        const product = await this.productRepository.findOne({
          where: { productId: receiptItemDto.product.productId },
        });
        if (!product) {
          throw new Error('Product not found');
        }

        const newRecieptItem = this.recieptItemRepository.create({
          quantity: receiptItemDto.quantity,
          reciept: recieptSave,
          sweetnessLevel: receiptItemDto.sweetnessLevel,
          receiptSubTotal: receiptItemDto.receiptSubTotal,
          product: product,
          productType: receiptItemDto.productType,
        });
        const recieptItemSave = await this.recieptItemRepository.save(
          newRecieptItem,
        );

        for (const productTypeToppingDto of receiptItemDto.productTypeToppings) {
          const productType = await this.productTypeRepository.findOne({
            where: { productTypeId: productTypeToppingDto.productTypeId },
            relations: ['product', 'product.category'],
          });
          const topping = await this.toppingRepository.findOne({
            where: { toppingId: productTypeToppingDto.toppingId },
          });

          if (!productType) {
            throw new Error('Product Type not found');
          }
          if (!topping) {
            throw new Error('Topping not found');
          }

          const newProductTypeTopping =
            this.productTypeToppingRepository.create({
              quantity: productTypeToppingDto.quantity,
              productType: productType,
              receiptItem: recieptItemSave,
              topping: topping,
            });

          if (
            productType.product.category.haveTopping &&
            productTypeToppingDto.toppingId
          ) {
            recieptItemSave.receiptSubTotal +=
              topping.toppingPrice * productTypeToppingDto.quantity;
          } else {
            recieptItemSave.receiptSubTotal +=
              productType.product.productPrice * productTypeToppingDto.quantity;
          }

          recieptItemSave.receiptSubTotal +=
            productType.product.productPrice + productType.productTypePrice;
          await this.productTypeToppingRepository.save(newProductTypeTopping);
        }
      }

      for (const receiptPromotion of createRecieptDto.receiptPromotions) {
        const recieptPromotion = new ReceiptPromotion();
        recieptPromotion.receipt = recieptSave;
        recieptPromotion.promotion = receiptPromotion.promotion;
        recieptPromotion.discount = receiptPromotion.discount;
        recieptPromotion.date = receiptPromotion.date;

        await this.recieptPromotionRepository.save(recieptPromotion);
      }

      const receiptFinish = await this.recieptRepository.save(newReciept);

      await this.updateIngredientStock(createRecieptDto.receiptItems);

      return await this.recieptRepository.findOne({
        where: { receiptId: receiptFinish.receiptId },
        relations: [
          'receiptItems',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.topping',
          'receiptItems.product',
          'user',
          'customer',
          'receiptPromotions',
          'receiptPromotions.promotion',
        ],
      });
    } catch (error) {
      console.error(error);
      throw new Error('Error creating receipt');
    }
  }

  private async updateIngredientStock(receiptItems) {
    for (const receiptItemDto of receiptItems) {
      const receiptItem = await this.recieptItemRepository.findOne({
        where: { receiptItemId: receiptItemDto.receiptItemId },
        relations: [
          'productTypeToppings',
          'productTypeToppings.productType',
          'productTypeToppings.productType.recipes',
          'productTypeToppings.productType.recipes.ingredient',
        ],
      });

      if (receiptItem && receiptItem.productTypeToppings) {
        for (const productTypeTopping of receiptItem.productTypeToppings) {
          if (
            productTypeTopping.productType &&
            productTypeTopping.productType.recipes
          ) {
            for (const recipe of productTypeTopping.productType.recipes) {
              const ingredient = recipe.ingredient;
              if (ingredient) {
                const oldRemaining = ingredient.ingredientRemining;
                ingredient.ingredientRemining = Math.round(
                  ingredient.ingredientRemining,
                );
                ingredient.ingredientRemining +=
                  receiptItemDto.quantity * recipe.quantity;

                if (
                  ingredient.ingredientRemining >
                  ingredient.ingredientQuantityPerUnit
                ) {
                  ingredient.ingredientRemining -=
                    ingredient.ingredientQuantityPerUnit;
                  ingredient.ingredientQuantityInStock -= 1;
                }

                await this.ingredientRepository.save(ingredient);
              }
            }
          }
        }
      }
    }
  }

  async cancelReceipt(id: number) {
    try {
      const reciept = await this.recieptRepository.findOne({
        where: { receiptId: id },
      });
      if (!reciept) {
        throw new HttpException('Reciept not found', HttpStatus.NOT_FOUND);
      }

      reciept.receiptStatus = 'cancel';

      return await this.recieptRepository.save(reciept);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to cancel receipt',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      const receipts = await this.recieptRepository.find({
        relations: [
          'receiptItems.productType',
          'receiptItems',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.productType',
          'receiptItems.productTypeToppings.productType.product',
          'receiptItems.productTypeToppings.productType.product',
          'receiptItems.productTypeToppings.topping',
          'receiptItems.product',
          'receiptItems.product.category',
          'user',
          'customer',
          'receiptPromotions',
          'receiptPromotions.promotion',
        ],
      });
      console.log(receipts); // ตรวจสอบข้อมูลที่ได้รับ
      return receipts;
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(id: number) {
    try {
      const reciept = await this.recieptRepository.findOne({
        where: { receiptId: id },
        relations: [
          'receiptItems',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.productType',
          'receiptItems.productTypeToppings.productType.product',
          'receiptItems.productTypeToppings.topping',
          'receiptItems.product',
          'user',
          'customer',
          'receiptPromotions',
          'receiptPromotions.promotion',
        ],
      });
      if (!reciept) {
        throw new HttpException('Reciept not found', HttpStatus.NOT_FOUND);
      }
      return reciept;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch reciept',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number) {
    try {
      const reciept = await this.recieptRepository.findOne({
        where: { receiptId: id },
      });
      if (!reciept) {
        throw new HttpException('Reciept not found', HttpStatus.NOT_FOUND);
      }
      return await this.recieptRepository.remove(reciept);
    } catch (error) {
      throw new HttpException(
        'Failed to delete reciept',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSumByPaymentMethod(paymentMethod: string): Promise<number> {
    const sum = await this.recieptRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.receiptTotalPrice)', 'totalPrice')
      .where('receipt.paymentMethod = :paymentMethod', { paymentMethod })
      .andWhere('DATE(receipt.createdDate) = CURDATE()')
      .getRawOne();

    return sum.totalPrice || 0;
  }

  async getSumTodayByPaymentMethod(): Promise<{
    cash: number;
    qrcode: number;
  }> {
    const cashSum = await this.getSumByPaymentMethod('cash');
    const qrcodeSum = await this.getSumByPaymentMethod('qrcode');
    return { cash: cashSum, qrcode: qrcodeSum };
  }
  async getDailyReport(): Promise<{
    totalSales: number;
    totalDiscount: number;
    totalTransactions: number;
  }> {
    try {
      const totalSalesResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('SUM(receipt.receiptNetPrice)', 'totalSales')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .getRawOne();
      const totalSales = totalSalesResult.totalSales || 0;

      const totalDiscountResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('SUM(receipt.receiptTotalDiscount)', 'totalDiscount')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .getRawOne();
      const totalDiscount = totalDiscountResult.totalDiscount || 0;

      const totalTransactionsResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('COUNT(receipt.receiptId)', 'totalTransactions')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .getRawOne();
      const totalTransactions = totalTransactionsResult.totalTransactions || 0;

      return {
        totalSales,
        totalDiscount,
        totalTransactions,
      };
    } catch (error) {
      this.logger.error('Failed to fetch daily report', error.stack);
      throw new HttpException(
        'Failed to fetch daily report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findTopIngredients(): Promise<
    { ingredient: Ingredient; count: number }[]
  > {
    try {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-07-01');

      const receipts = await this.recieptRepository.find({
        where: {
          createdDate: Between(startDate, endDate),
        },
        relations: [
          'receiptItems',
          'receiptItems.productType',
          'receiptItems.productType.recipes',
          'receiptItems.productType.recipes.ingredient',
        ],
      });

      // Count ingredients usage
      const ingredientCounts = new Map<
        number,
        { ingredient: Ingredient; count: number }
      >();

      receipts.forEach((receipt) => {
        receipt.receiptItems.forEach((receiptItem) => {
          if (receiptItem.productType && receiptItem.productType.recipes) {
            receiptItem.productType.recipes.forEach((recipe) => {
              if (recipe.ingredient) {
                const { ingredientId: ingredientId } = recipe.ingredient; // Adjust based on the actual property name
                if (ingredientCounts.has(ingredientId)) {
                  ingredientCounts.get(ingredientId).count += 1;
                } else {
                  ingredientCounts.set(ingredientId, {
                    ingredient: recipe.ingredient,
                    count: 1,
                  });
                }
              }
            });
          }
        });
      });

      // Convert map to array and sort by count descending
      const sortedIngredients = Array.from(ingredientCounts.values()).sort(
        (a, b) => b.count - a.count,
      );

      // Return top 5 ingredients
      return sortedIngredients.slice(0, 5);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  }
  async getGroupedReceipts(start: Date, end: Date) {
    try {
      const receipts = await this.recieptRepository
        .createQueryBuilder('receipt')
        .where('receipt.createdDate BETWEEN :startDate AND :endDate', {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
        .andWhere('receipt.receiptType = :receiptType', {
          receiptType: 'coffee', // ตั้งค่า receiptType ตามที่ต้องการ
        })
        .getMany();

      const groupedByDay = {};
      const groupedByMonth = {};
      const groupedByYear = {};

      receipts.forEach((receipt) => {
        const createdDate = new Date(receipt.createdDate);
        const day = createdDate.toISOString().split('T')[0];
        const month = createdDate.toISOString().slice(0, 7);
        const year = createdDate.getFullYear();

        groupedByDay[day] = (groupedByDay[day] || 0) + receipt.receiptNetPrice;
        groupedByMonth[month] =
          (groupedByMonth[month] || 0) + receipt.receiptNetPrice;
        groupedByYear[year] =
          (groupedByYear[year] || 0) + receipt.receiptNetPrice;
      });

      return {
        groupedByDay,
        groupedByMonth,
        groupedByYear,
      };
    } catch (error) {
      console.error('Error in getGroupedReceipts:', error);
      throw new Error('Error while grouping receipts: ' + error.message);
    }
  }
}
