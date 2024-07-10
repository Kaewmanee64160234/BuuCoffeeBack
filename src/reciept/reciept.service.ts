import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reciept } from './entities/reciept.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Repository, Between } from 'typeorm';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
import * as moment from 'moment-timezone';
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
    try {
      const user = await this.userRepository.findOne({
        where: { userId: createRecieptDto.userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const customer = createRecieptDto.customer
        ? await this.customerRepository.findOne({
            where: { customerId: createRecieptDto.customer.customerId },
          })
        : null;

      if (createRecieptDto.customer && !customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
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
        queueNumber: createRecieptDto.queueNumber,
      });

      const recieptSave = await this.recieptRepository.save(newReciept);

      for (const receiptItemDto of createRecieptDto.receiptItems) {
        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity <= 0) {
          throw new HttpException(
            'Invalid quantity value',
            HttpStatus.BAD_REQUEST,
          );
        }

        const product = await this.productRepository.findOne({
          where: { productId: receiptItemDto.product.productId },
        });
        if (!product) {
          throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
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
        console.log(receiptItemDto.productTypeToppings);
        for (const productTypeToppingDto of receiptItemDto.productTypeToppings) {
          const productType = await this.productTypeRepository.findOne({
            where: { productTypeId: productTypeToppingDto.productTypeId },
            relations: ['product', 'product.category'],
          });
          const topping = await this.toppingRepository.findOne({
            where: { toppingId: productTypeToppingDto.topping.toppingId },
          });
          console.log(topping);
          if (!productType) {
            throw new HttpException(
              'Product Type not found',
              HttpStatus.NOT_FOUND,
            );
          }
          if (!topping) {
            throw new HttpException('Topping not found', HttpStatus.NOT_FOUND);
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
    } catch (error) {
      this.logger.error('Error creating receipt', error.stack);
      throw new HttpException(
        'Error creating receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      // check if in 30 min can cancle
      const receipt = await this.recieptRepository.findOne({
        where: { receiptId: id },
        relations: ['receiptItems'],
      });
      if (!receipt) {
        throw new HttpException('Receipt not found', HttpStatus.NOT_FOUND);
      }

      const currentDate = new Date();
      const receiptDate = new Date(receipt.createdDate);
      const diff = Math.abs(currentDate.getTime() - receiptDate.getTime());
      const minutes = Math.floor(diff / 60000);

      if (minutes > 1440) {
        throw new HttpException(
          'Receipt can not be cancelled after 30 minutes',
          HttpStatus.BAD_REQUEST,
        );
      }

      receipt.receiptStatus = 'cancel';
      await this.recieptRepository.save(receipt);
    } catch (error) {
      this.logger.error('Failed to cancel receipt', error.stack);
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
      return receipts;
    } catch (error) {
      this.logger.error('Error fetching receipts', error.stack);
      throw new HttpException(
        'Error fetching receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      this.logger.error('Error fetching receipt', error.stack);
      throw new HttpException('Error fetching receipt', HttpStatus.BAD_REQUEST);
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
      this.logger.error('Error deleting receipt', error.stack);
      throw new HttpException(
        'Failed to delete receipt',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(receiptId: number, updateReceiptDto: UpdateRecieptDto) {
    try {
      const existingReceipt = await this.recieptRepository.findOne({
        where: { receiptId },
        relations: [
          'receiptItems',
          'receiptItems.productType',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.productType',
          'receiptItems.productTypeToppings.topping',
          'receiptItems.product',
          'receiptPromotions',
        ],
      });

      if (!existingReceipt) {
        throw new HttpException('Receipt not found', HttpStatus.NOT_FOUND);
      }

      const user = await this.userRepository.findOne({
        where: { userId: updateReceiptDto.userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const customer = updateReceiptDto.customer
        ? await this.customerRepository.findOne({
            where: { customerId: updateReceiptDto.customer.customerId },
          })
        : null;

      if (updateReceiptDto.customer && !customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }

      // Rollback previous customer stamps if applicable
      if (existingReceipt.customer) {
        existingReceipt.customer.customerNumberOfStamp -=
          existingReceipt.receiptItems.reduce(
            (acc, item) => item.quantity + acc,
            0,
          );
        await this.customerRepository.save(existingReceipt.customer);
      }

      // Apply new customer stamps if applicable
      if (customer !== null) {
        customer.customerNumberOfStamp += updateReceiptDto.receiptItems.reduce(
          (acc, item) => item.quantity + acc,
          0,
        );
        await this.customerRepository.save(customer);
      }

      // Update receipt details
      existingReceipt.receiptTotalPrice = updateReceiptDto.receiptTotalPrice;
      existingReceipt.receiptTotalDiscount =
        updateReceiptDto.receiptTotalDiscount;
      existingReceipt.receiptNetPrice = updateReceiptDto.receiptNetPrice;
      existingReceipt.receiptStatus = updateReceiptDto.receiptStatus;
      existingReceipt.user = user;
      existingReceipt.customer = customer;
      existingReceipt.receiptType = updateReceiptDto.receiptType;
      existingReceipt.paymentMethod = updateReceiptDto.paymentMethod;
      existingReceipt.queueNumber = updateReceiptDto.queueNumber;

      // Remove existing receipt items and promotions
      await this.recieptItemRepository.remove(existingReceipt.receiptItems);
      await this.recieptPromotionRepository.remove(
        existingReceipt.receiptPromotions,
      );

      // Add updated receipt items
      const updatedReceiptItems = [];
      for (const receiptItemDto of updateReceiptDto.receiptItems) {
        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity <= 0) {
          throw new HttpException(
            'Invalid quantity value',
            HttpStatus.BAD_REQUEST,
          );
        }

        const product = await this.productRepository.findOne({
          where: { productId: receiptItemDto.product.productId },
        });
        if (!product) {
          throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        const newReceiptItem = this.recieptItemRepository.create({
          quantity: receiptItemDto.quantity,
          reciept: existingReceipt,
          sweetnessLevel: receiptItemDto.sweetnessLevel,
          receiptSubTotal: receiptItemDto.receiptSubTotal,
          product: product,
          productType: receiptItemDto.productType,
        });

        const savedReceiptItem = await this.recieptItemRepository.save(
          newReceiptItem,
        );

        // Add product type toppings
        for (const productTypeToppingDto of receiptItemDto.productTypeToppings) {
          const productType = await this.productTypeRepository.findOne({
            where: { productTypeId: productTypeToppingDto.productTypeId },
            relations: ['product', 'product.category'],
          });
          const topping = await this.toppingRepository.findOne({
            where: { toppingId: productTypeToppingDto.topping.toppingId },
          });

          if (!productType) {
            throw new HttpException(
              'Product Type not found',
              HttpStatus.NOT_FOUND,
            );
          }
          if (!topping) {
            throw new HttpException('Topping not found', HttpStatus.NOT_FOUND);
          }

          const newProductTypeTopping =
            this.productTypeToppingRepository.create({
              quantity: productTypeToppingDto.quantity,
              productType: productType,
              receiptItem: savedReceiptItem,
              topping: topping,
            });

          savedReceiptItem.receiptSubTotal +=
            topping.toppingPrice * productTypeToppingDto.quantity;

          await this.productTypeToppingRepository.save(newProductTypeTopping);
        }

        updatedReceiptItems.push(savedReceiptItem);
      }

      // Add updated receipt promotions
      const updatedReceiptPromotions = [];
      for (const receiptPromotion of updateReceiptDto.receiptPromotions) {
        const newReceiptPromotion = this.recieptPromotionRepository.create({
          receipt: existingReceipt,
          promotion: receiptPromotion.promotion,
          discount: receiptPromotion.discount,
          date: receiptPromotion.date,
        });
        updatedReceiptPromotions.push(newReceiptPromotion);
        await this.recieptPromotionRepository.save(newReceiptPromotion);
      }

      // Save the updated receipt with new items and promotions
      existingReceipt.receiptItems = updatedReceiptItems;
      existingReceipt.receiptPromotions = updatedReceiptPromotions;

      const receiptFinish = await this.recieptRepository.save(existingReceipt);

      // Update ingredient stock
      await this.updateIngredientStock(updateReceiptDto.receiptItems);

      // Return the updated receipt with all relations
      return await this.recieptRepository.findOne({
        where: { receiptId: receiptFinish.receiptId },
        relations: [
          'receiptItems.productType',
          'receiptItems',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.productType',
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
    } catch (error) {
      this.logger.error('Error updating receipt', error.stack);
      throw new HttpException(
        'Error updating receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      this.logger.error('Error fetching receipts', error.stack);
      throw new HttpException(
        'Error fetching receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGroupedReceipts(start: Date, end: Date, receiptType: string) {
    try {
      if (!(start instanceof Date) || isNaN(start.getTime())) {
        throw new Error('Invalid start date');
      }

      if (!(end instanceof Date) || isNaN(end.getTime())) {
        end = new Date();
      }

      const receipts = await this.recieptRepository
        .createQueryBuilder('receipt')
        .where('receipt.createdDate BETWEEN :startDate AND :endDate', {
          startDate: moment(start)
            .tz('Asia/Bangkok')
            .startOf('day')
            .toISOString(),
          endDate: moment(end).tz('Asia/Bangkok').endOf('day').toISOString(),
        })
        .andWhere('receipt.receiptType = :receiptType', {
          receiptType: receiptType,
        })
        .getMany();

      const groupedByDay = {};
      const groupedByMonth = {};
      const groupedByYear = {};

      receipts.forEach((receipt) => {
        const createdDate = moment(receipt.createdDate).tz('Asia/Bangkok');
        const day = createdDate.format('YYYY-MM-DD');
        const month = createdDate.format('YYYY-MM');
        const year = createdDate.year();

        // Logging for debugging
        // console.log(
        //   `Receipt ID: ${
        //     receipt.receiptId
        //   }, Created Date: ${createdDate.format()}, Day: ${day}`,
        // );

        groupedByDay[day] = (groupedByDay[day] || 0) + receipt.receiptNetPrice;
        groupedByMonth[month] =
          (groupedByMonth[month] || 0) + receipt.receiptNetPrice;
        groupedByYear[year] =
          (groupedByYear[year] || 0) + receipt.receiptNetPrice;
      });

      // Logging for debugging
      // console.log('Receipts:', receipts);
      // console.log('Grouped by Day:', groupedByDay);
      // console.log('Grouped by Month:', groupedByMonth);
      // console.log('Grouped by Year:', groupedByYear);

      return {
        groupedByDay,
        groupedByMonth,
        groupedByYear,
      };
    } catch (error) {
      this.logger.error('Error in getGroupedReceipts', error.stack);
      throw new HttpException(
        'Error while grouping receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTopSellingProductsByDate(date: Date): Promise<any[]> {
    try {
      const startOfDay = moment(date)
        .tz('Asia/Bangkok')
        .startOf('day')
        .toDate();
      const endOfDay = moment(date).tz('Asia/Bangkok').endOf('day').toDate();
      const products = await this.productRepository.find({
        relations: ['productTypes'],
      });
      const receipts = await this.recieptRepository.find({
        where: {
          createdDate: Between(startOfDay, endOfDay),
        },
        relations: [
          'receiptItems',
          'receiptItems.product',
          'receiptItems.productType',
        ],
      });
      const productSalesMap = new Map<
        number,
        {
          productId: number;
          productName: string;
          productType: string;
          count: number;
        }
      >();
      products.forEach((product) => {
        if (product.productTypes.length > 0) {
          product.productTypes.forEach((type) => {
            productSalesMap.set(type.productTypeId, {
              productId: product.productId,
              productName: product.productName,
              productType: type.productTypeName,
              count: 0,
            });
          });
        } else {
          productSalesMap.set(product.productId, {
            productId: product.productId,
            productName: product.productName,
            productType: 'No Type',
            count: 0,
          });
        }
      });

      receipts.forEach((receipt) => {
        receipt.receiptItems.forEach((item) => {
          const productId = item.product.productId;
          const productTypeId = item.productType?.productTypeId;

          if (productTypeId && productSalesMap.has(productTypeId)) {
            productSalesMap.get(productTypeId).count += parseInt(
              String(item.quantity),
            );
          } else if (!item.productType && productSalesMap.has(productId)) {
            productSalesMap.get(productId).count += parseInt(
              String(item.quantity),
            );
          }
        });
      });
      const productsArray = Array.from(productSalesMap.values());
      productsArray.sort((a, b) => b.count - a.count);
      const response = productsArray.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        productType: product.productType,
        count: product.count,
      }));

      return response;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch top selling products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecieptIn1Day(typeOfStore: string): Promise<Reciept[]> {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() - 24 * 60 * 60000); // 24 hours in milliseconds
    const endDate = new Date(currentDate.getTime());
    return await this.recieptRepository.find({
      where: {
        createdDate: Between(startDate, endDate),
        receiptStatus: 'paid',
        receiptType: typeOfStore,
      },
      relations: [
        'receiptItems',
        'receiptItems.productType',
        'receiptItems.productType.recipes',
        'receiptItems.productType.recipes.ingredient',
        'receiptItems.productTypeToppings',
        'receiptItems.productTypeToppings.productType',
        'receiptItems.productTypeToppings.topping',
        'receiptItems.product',
        'receiptItems.product.category',
        'user',
        'customer',
        'receiptPromotions',
        'receiptPromotions.promotion',
      ],
    });
  }
}
