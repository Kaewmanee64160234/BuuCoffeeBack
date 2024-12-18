import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reciept } from './entities/reciept.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import {
  Repository,
  Between,
  Not,
  Like,
  MoreThanOrEqual,
  LessThanOrEqual,
  IsNull,
} from 'typeorm';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
import * as moment from 'moment-timezone';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Cashier } from 'src/cashiers/entities/cashier.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';
import { MealProduct } from 'src/meal-products/entities/meal-product.entity';
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
    @InjectRepository(Importingredient)
    private importIngredientRepository: Repository<Importingredient>,
    // check stock
    @InjectRepository(Checkingredient)
    private checkIngredientRepository: Repository<Checkingredient>,
    @InjectRepository(Cashier)
    private readonly cashierRepository: Repository<Cashier>,
    // recipe
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,

    @InjectRepository(SubInventoriesCoffee)
    private subInventoryCoffeeRepository: Repository<SubInventoriesCoffee>,
    // /subInventoryRepository rice
    @InjectRepository(SubInventoriesRice)
    private subInventoryRiceRepository: Repository<SubInventoriesRice>,
    //  receiptItemRepository
    @InjectRepository(ReceiptItem)
    private receiptItemRepository: Repository<ReceiptItem>,
    // mealProductRepository
    @InjectRepository(MealProduct)
    private mealProductRepository: Repository<MealProduct>,
  ) {}

  async create(createRecieptDto: CreateRecieptDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId: createRecieptDto.userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      let customer = null;
      if (createRecieptDto.customer && createRecieptDto.customer.customerId) {
        customer = await this.customerRepository.findOne({
          where: { customerId: createRecieptDto.customer.customerId },
        });
        if (!customer) {
          throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
        }
      }

      const receiptNumber = await this.getNextReceiptNumber();
      const newReciept = this.recieptRepository.create({
        receiptNumber: receiptNumber,
        receiptTotalPrice: createRecieptDto.receiptTotalPrice,
        receiptTotalDiscount: createRecieptDto.receiptTotalDiscount,
        receiptNetPrice: createRecieptDto.receiptNetPrice,
        receiptStatus: createRecieptDto.receiptStatus,
        user: user,
        customer: customer,
        receiptType: createRecieptDto.receiptType,
        paymentMethod: createRecieptDto.paymentMethod,
        queueNumber: createRecieptDto.queueNumber,
        change: createRecieptDto.change,
        receive: createRecieptDto.receive,
      });

      const recieptSave = await this.recieptRepository.save(newReciept);
      let totalPoints = 0;

      // Processing receipt items
      for (const receiptItemDto of createRecieptDto.receiptItems) {
        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity <= 0) {
          throw new HttpException(
            'Invalid quantity value',
            HttpStatus.BAD_REQUEST,
          );
        }

        const product = await this.productRepository.findOne({
          where: { productId: receiptItemDto.product.productId },
          relations: [
            'category',
            'productTypes',
            'productTypes.recipes',
            'productTypes.recipes.ingredient',
            'ingredient',
          ],
        });

        if (!product) {
          throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        let productType = null;
        if (receiptItemDto.productType == null) {
          productType = await this.productTypeRepository.findOne({
            where: { productTypeId: product.productTypes[0].productTypeId },
            relations: [
              'product',
              'product.category',
              'recipes',
              'recipes.ingredient',
            ],
          });
        } else {
          productType = await this.productTypeRepository.findOne({
            where: { productTypeId: receiptItemDto.productType.productTypeId },
            relations: [
              'product',
              'product.category',
              'recipes',
              'recipes.ingredient',
            ],
          });
        }

        if (!productType) {
          throw new HttpException(
            'Product Type not found',
            HttpStatus.NOT_FOUND,
          );
        }

        // Inventory check for products that have `haveTopping` = false and `needLinkIngredient` = true
        if (
          product.haveTopping === false &&
          product.needLinkIngredient === true &&
          recieptSave.receiptStatus !== 'ร้านจัดเลี้ยง'
        ) {
          console.log('product', product);

          if (product.storeType === 'ร้านกาแฟ') {
            const ingredient = await this.ingredientRepository.findOne({
              where: {
                ingredientId: product.ingredient.ingredientId,
              },
            });
            const inventory = await this.subInventoryCoffeeRepository.findOne({
              where: {
                ingredient: { ingredientId: ingredient.ingredientId },
              },
            });

            if (!inventory) {
              throw new HttpException(
                'Inventory not found',
                HttpStatus.NOT_FOUND,
              );
            }

            const availableQuantity =
              inventory.quantity - inventory.reservedQuantity;
            if (availableQuantity < receiptItemDto.quantity) {
              throw new HttpException(
                `Insufficient inventory for product ${product.productName}`,
                HttpStatus.BAD_REQUEST,
              );
            }

            // Deduct the quantity from the inventory
            inventory.quantity -= receiptItemDto.quantity;
            await this.subInventoryCoffeeRepository.save(inventory);
          }
          if (product.storeType === 'ร้านข้าว') {
            const ingredient = await this.ingredientRepository.findOne({
              where: {
                ingredientId: product.ingredient.ingredientId,
              },
            });
            const inventory = await this.subInventoryRiceRepository.findOne({
              where: {
                ingredient: { ingredientId: ingredient.ingredientId },
              },
            });

            if (!inventory) {
              throw new HttpException(
                'Inventory not found',
                HttpStatus.NOT_FOUND,
              );
            }

            const availableQuantity =
              inventory.quantity - inventory.reservedQuantity;
            if (availableQuantity < receiptItemDto.quantity) {
              throw new HttpException(
                `Insufficient inventory for product ${product.productName}`,
                HttpStatus.BAD_REQUEST,
              );
            }

            // Deduct the quantity from the inventory
            inventory.quantity -= receiptItemDto.quantity;
            await this.subInventoryRiceRepository.save(inventory);
          }
        }
        const newRecieptItem = this.recieptItemRepository.create({
          ...receiptItemDto,
          reciept: recieptSave,
          product: product,
          productType: productType,
          receiptSubTotal: receiptItemDto.receiptSubTotal,
        });

        const recieptItemSave = await this.recieptItemRepository.save(
          newRecieptItem,
        );

        if (
          product.haveTopping &&
          receiptItemDto.productTypeToppings.length > 0
        ) {
          const productTypeToppings = [];
          for (let i = 0; i < receiptItemDto.productTypeToppings.length; i++) {
            const toppingProductType = await this.productTypeRepository.findOne(
              {
                where: {
                  productTypeId:
                    receiptItemDto.productTypeToppings[i].productType
                      .productTypeId,
                },
                relations: [
                  'product',
                  'product.category',
                  'recipes',
                  'recipes.ingredient',
                ],
              },
            );

            if (!toppingProductType) {
              throw new HttpException(
                'Topping Product Type not found',
                HttpStatus.NOT_FOUND,
              );
            }

            const topping = await this.toppingRepository.findOne({
              where: {
                toppingId:
                  receiptItemDto.productTypeToppings[i].topping.toppingId,
              },
            });

            if (!topping) {
              throw new HttpException(
                'Topping not found',
                HttpStatus.NOT_FOUND,
              );
            }

            const newProductTypeTopping =
              this.productTypeToppingRepository.create({
                ...receiptItemDto.productTypeToppings[i],
                productType: toppingProductType,
                receiptItem: recieptItemSave,
                topping: topping,
              });

            const productTypeToppingSaved =
              await this.productTypeToppingRepository.save(
                newProductTypeTopping,
              );
            productTypeToppings.push(productTypeToppingSaved);
          }

          recieptItemSave.productTypeToppings = productTypeToppings;

          await this.recieptItemRepository.save(recieptItemSave);
        }

        if (product.countingPoint) {
          totalPoints += receiptItemDto.quantity;
        }

        await this.recieptItemRepository.save(recieptItemSave);
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

      if (createRecieptDto.receiptType === 'ร้านจัดเลี้ยง') {
        if (createRecieptDto.checkStockId) {
          console.log('createRecieptDto.receiptType', createRecieptDto);
        } else {
          // receiptFinish.checkIngredientId = null;
        }
        if (createRecieptDto.createdDate) {
          receiptFinish.createdDate = createRecieptDto.createdDate;
        }
        await this.recieptRepository.save(receiptFinish);
      }

      if (customer) {
        customer.customerNumberOfStamp += totalPoints;
        await this.customerRepository.save(customer);
      }

      const recipt = await this.recieptRepository.findOne({
        where: { receiptId: receiptFinish.receiptId },
        relations: [
          'receiptItems.productType',
          'receiptItems',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.productType',
          'receiptItems.productTypeToppings.productType.recipes',
          'receiptItems.productTypeToppings.productType.recipes.ingredient',
          'receiptItems.productTypeToppings.topping',
          'receiptItems.product',
          'receiptItems.product.category',
          'user',
          'customer',
          'receiptPromotions',
          'receiptPromotions.promotion',
        ],
      });

      return recipt;
    } catch (error) {
      console.log('Error creating receipt', error);

      this.logger.error('Error creating receipt', error.stack);
      throw new HttpException(
        'Error creating receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getNextReceiptNumber(): Promise<number> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();

    // Check if it's the 9th of September
    if (currentMonth === 9 && currentDay === 9) {
      // Find the last receipt created on this specific day (9th September)
      const lastReceiptOnSeptember9 = await this.recieptRepository
        .createQueryBuilder('receipt')
        .where('YEAR(receipt.createdDate) = :year', { year: currentYear })
        .andWhere('MONTH(receipt.createdDate) = :month', { month: 10 })
        .andWhere('DAY(receipt.createdDate) = :day', { day: 1 })
        .orderBy('receipt.receiptId', 'DESC')
        .getOne();
      console.log('lastReceiptOnSeptember9', lastReceiptOnSeptember9);

      if (lastReceiptOnSeptember9) {
        return lastReceiptOnSeptember9.receiptNumber + 1;
      } else {
        // Reset to 1 for the first receipt on 9th September
        return 1;
      }
    } else {
      // For all other days, continue counting as normal
      const lastReceipt = await this.recieptRepository
        .createQueryBuilder('receipt')
        .where('YEAR(receipt.createdDate) = :year', { year: currentYear })
        .orderBy('receipt.receiptNumber', 'DESC')
        .getOne();

      if (lastReceipt) {
        // Increment from the last receipt number
        return lastReceipt.receiptNumber + 1;
      } else {
        // If no receipts are found, start with 1
        return 1;
      }
    }
  }

  // private async updateIngredientStock(receiptItems: ReceiptItem[]) {
  //   for (const receiptItemDto of receiptItems) {
  //     // Fetch the receipt item and related entities
  //     const receiptItem = await this.recieptItemRepository.findOne({
  //       where: { receiptItemId: receiptItemDto.receiptItemId },
  //       relations: [
  //         'product',
  //         'productType',
  //         'productTypeToppings',
  //         'productTypeToppings.productType',
  //         'productTypeToppings.productType.recipes',
  //         'productTypeToppings.productType.recipes.ingredient',
  //       ],
  //     });

  //     if (
  //       !receiptItemDto.productTypeToppings ||
  //       receiptItemDto.productTypeToppings.length == 0
  //     ) {
  //       //  cutting stock from quantity

  //       const product = await this.productRepository.findOne({
  //         where: { productId: receiptItemDto.product.productId },
  //         relations: [
  //           'category',
  //           'productTypes',
  //           'productTypes.recipes',
  //           'productTypes.recipes.ingredient',
  //         ],
  //       });
  //       const ingredient = await this.ingredientRepository.findOne({
  //         where: {
  //           ingredientId:
  //             product.productTypes[0].recipes[0].ingredient.ingredientId,
  //         },
  //       });

  //       if (ingredient) {
  //         if (product.haveTopping == false) {
  //           ingredient.ingredientRemining -= receiptItemDto.quantity;
  //           ingredient.ingredientQuantityInStock -= receiptItemDto.quantity;
  //           ingredient.ingredientRemining = Math.max(
  //             0,
  //             ingredient.ingredientRemining,
  //           );

  //           console.log('No topping');
  //           console.log('Ingredient Remaining:', ingredient.ingredientRemining);
  //           console.log('================================================');
  //         } else {
  //           const processedIngredients = new Set<number>();
  //           let recipe = null;

  //           if (receiptItemDto.productType) {
  //             recipe = await this.recipeRepository.findOne({
  //               where: {
  //                 productType: {
  //                   productTypeId: receiptItemDto.productType.productTypeId,
  //                 },
  //               },
  //               relations: ['ingredient'],
  //             });
  //           } else {
  //             recipe = await this.recipeRepository.findOne({
  //               where: {
  //                 productType: {
  //                   productTypeId: receiptItemDto.productType.productTypeId,
  //                 },
  //               },
  //               relations: ['ingredient'],
  //             });
  //           }

  //           if (
  //             ingredient &&
  //             !processedIngredients.has(ingredient.ingredientId)
  //           ) {
  //             processedIngredients.add(ingredient.ingredientId);

  //             const oldRemaining = ingredient.ingredientRemining;
  //             ingredient.ingredientRemining = Math.round(
  //               ingredient.ingredientRemining,
  //             );
  //             ingredient.ingredientRemining +=
  //               receiptItemDto.quantity * recipe.quantity;

  //             if (
  //               ingredient.ingredientRemining >
  //               ingredient.ingredientQuantityPerUnit
  //             ) {
  //               ingredient.ingredientRemining -=
  //                 ingredient.ingredientQuantityPerUnit;
  //               ingredient.ingredientQuantityInStock -= 1;
  //             }

  //             // Ensure remaining quantity does not go below zero
  //             ingredient.ingredientRemining = Math.max(
  //               0,
  //               ingredient.ingredientRemining,
  //             );

  //             // Allow stock quantity to go below zero
  //           }
  //           console.log('upate with havetopping but noy select');

  //           console.log('Ingredient Remaining:', ingredient.ingredientRemining);

  //           console.log('================================================');
  //         }
  //       }
  //       await this.ingredientRepository.save(ingredient);
  //     } else {
  //       // Track ingredients processed for this receipt item
  //       const processedIngredients = new Set<number>();

  //       // Process the productTypeToppings
  //       for (const productTypeTopping of receiptItemDto.productTypeToppings) {
  //         if (
  //           productTypeTopping.productType &&
  //           productTypeTopping.productType.recipes
  //         ) {
  //           for (const recipe of productTypeTopping.productType.recipes) {
  //             // console.log('recipe', recipe);
  //             const ingredient = await this.ingredientRepository.findOne({
  //               where: { ingredientId: recipe.ingredient.ingredientId },
  //             });

  //             if (
  //               ingredient &&
  //               !processedIngredients.has(ingredient.ingredientId)
  //             ) {
  //               processedIngredients.add(ingredient.ingredientId);

  //               const oldRemaining = ingredient.ingredientRemining;
  //               ingredient.ingredientRemining = Math.round(
  //                 ingredient.ingredientRemining,
  //               );
  //               ingredient.ingredientRemining +=
  //                 receiptItem.quantity * recipe.quantity;

  //               if (
  //                 ingredient.ingredientRemining >
  //                 ingredient.ingredientQuantityPerUnit
  //               ) {
  //                 ingredient.ingredientRemining -=
  //                   ingredient.ingredientQuantityPerUnit;
  //                 ingredient.ingredientQuantityInStock -= 1;
  //               }

  //               // Allow stock quantity to go below zero

  //               console.log('have topping and select topping');
  //               console.log('Old Remaining', oldRemaining);

  //               console.log(
  //                 'Ingredient Remaining:',
  //                 ingredient.ingredientRemining,
  //               );
  //               console.log('================================================');
  //               await this.ingredientRepository.save(ingredient);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  private async revertIngredientStock(receiptItems: ReceiptItem[]) {
    for (const receiptItemDto of receiptItems) {
      const receiptItem = await this.recieptItemRepository.findOne({
        where: { receiptItemId: receiptItemDto.receiptItemId },
        relations: [
          'productType',
          'productTypeToppings',
          'productTypeToppings.productType',
          'productTypeToppings.productType.recipes',
          'productTypeToppings.productType.recipes.ingredient',
        ],
      });

      if (receiptItem.productTypeToppings.length == 0) {
        let productType = null;
        if (receiptItem.productType.productTypeId) {
          productType = await this.productTypeRepository.findOne({
            where: { productTypeId: receiptItem.productType.productTypeId },
            relations: ['recipes', 'recipes.ingredient'],
          });
        } else {
          productType = await this.productTypeRepository.findOne({
            where: { productTypeId: receiptItemDto.productType.productTypeId },
            relations: ['recipes', 'recipes.ingredient'],
          });
        }
        // const ingredient = productType.recipes[0].ingredient;

        // if (ingredient) {
        //   ingredient.ingredientRemining =
        //     parseInt(ingredient.ingredientRemining.toString()) +
        //     parseInt(receiptItem.quantity.toString());
        //   ingredient.ingredientQuantityInStock =
        //     parseInt(ingredient.ingredientQuantityInStock.toString()) +
        //     parseInt(receiptItem.quantity.toString());
        //   await this.ingredientRepository.save(ingredient);
        // }
      } else {
        const processedIngredients = new Set<number>();

        // for (const productTypeTopping of receiptItem.productTypeToppings) {
        //   if (
        //     productTypeTopping.productType &&
        //     productTypeTopping.productType.recipes
        //   ) {
        //     for (const recipe of productTypeTopping.productType.recipes) {
        //       const ingredient = recipe.ingredient;
        //       if (
        //         ingredient &&
        //         !processedIngredients.has(ingredient.ingredientId)
        //       ) {
        //         processedIngredients.add(ingredient.ingredientId);

        //         await this.ingredientRepository.save(ingredient);
        //       }
        //     }
        //   }
        // }

        // if (receiptItem.productType?.recipes) {
        //   for (const recipe of receiptItem.productType.recipes) {
        //     const ingredient = recipe.ingredient;
        //     if (
        //       ingredient &&
        //       !processedIngredients.has(ingredient.ingredientId)
        //     ) {
        //       processedIngredients.add(ingredient.ingredientId);

        //       await this.ingredientRepository.save(ingredient);
        //     }
        //   }
        // }
      }
    }
  }
  async findAllQueryDate(
    startDate: string,
    endDate: string,
    receiptType?: string,
  ): Promise<any[]> {
    try {
      // แปลงวันที่จาก string เป็น Date
      const start = new Date(startDate);
      const end = new Date(endDate);

      // ตรวจสอบการแปลงวันที่
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      const queryOptions: any = {
        where: {
          createdDate: Between(start, end),
        },
        relations: [
          'receiptItems.productType',
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
      };

      if (receiptType && receiptType !== 'ทั้งหมด') {
        queryOptions.where['receiptType'] = receiptType;
      }

      const receipts = await this.recieptRepository.find(queryOptions);

      // <------จัดรูปแบบข้อมูล ----------------------------------->
      return receipts.map((receipt) => ({
        receiptTotalPrice: receipt.receiptTotalPrice,
        receiptTotalDiscount: receipt.receiptTotalDiscount,
        receiptNetPrice: receipt.receiptNetPrice,
        receiptStatus: receipt.receiptStatus,
        receiptType: receipt.receiptType,
        queueNumber: receipt.queueNumber,
        paymentMethod: receipt.paymentMethod,
        createdDate: receipt.createdDate,
        updatedDate: receipt.updatedDate,
        receiptItems: receipt.receiptItems.map((item) => ({
          quantity: item.quantity,
          receiptSubTotal: item.receiptSubTotal,
          sweetnessLevel: item.sweetnessLevel,
          productType: item.productType
            ? {
                productTypeId: item.productType.productTypeId,
                productTypeName: item.productType.productTypeName,
                productTypePrice: item.productType.productTypePrice,
              }
            : null,
          productTypeToppings: item.productTypeToppings.map((topping) => ({
            productTypeToppingId: topping.productTypeToppingId,
          })),
          product: item.product
            ? {
                productId: item.product.productId,
                productName: item.product.productName,
                productPrice: item.product.productPrice,
                productImage: item.product.productImage,
                storeType: item.product.storeType,
                category: item.product.category
                  ? {
                      categoryId: item.product.category.categoryId,
                      categoryName: item.product.category.categoryName,
                    }
                  : null,
              }
            : null,
        })),
        user: receipt.user
          ? {
              userName: receipt.user.userName,
            }
          : null,
        customer: receipt.customer,
        receiptPromotions: receipt.receiptPromotions.map((promotion) => ({
          discount: promotion.discount,
          promotion: promotion.promotion
            ? {
                promotionName: promotion.promotion.promotionName,
              }
            : null,
        })),
      }));
    } catch (error) {
      throw new HttpException(
        'Error fetching receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      await this.revertIngredientStock(receipt.receiptItems);

      await this.recieptRepository.save(receipt);
    } catch (error) {
      this.logger.error('Failed to cancel receipt', error.stack);
      throw new HttpException(
        'Failed to cancel receipt',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getReceipts(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Reciept[]; total: number }> {
    // const whereCondition = search ? { receiptNumber: Like(`%${search}%`) } : {};

    const [data, total] = await this.recieptRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      // where: whereCondition,
      relations: [
        'customer',
        'user',
        'receiptPromotions',
        'receiptPromotions.promotion',
      ],
    });

    return { data, total };
  }

  // async getReceiptsBackup(
  //   page: number,
  //   limit: number,
  //   search: string,
  // ): Promise<{ data: Reciept[]; total: number }> {
  //   // const whereCondition = search ? { receiptNumber: Like(`%${search}%`) } : {};

  //   const [data, total] = await this.recieptRepository.findAndCount({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     // where: whereCondition,
  //     relations: [
  //       'customer',
  //       'user',
  //       'receiptPromotions',
  //       'receiptPromotions.promotion',
  //     ],
  //   });

  //   return { data, total };
  // }

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
      // Fetch the receipt with all related entities
      const receipt = await this.recieptRepository.findOne({
        where: { receiptId: id },
        relations: [
          'receiptItems',
          'receiptItems.productTypeToppings',
          'receiptItems.productTypeToppings.productType',
        ],
      });

      if (!receipt) {
        throw new HttpException('Receipt not found', HttpStatus.NOT_FOUND);
      }

      // Remove all related productTypeToppings for each receipt item
      for (const item of receipt.receiptItems) {
        if (item.productTypeToppings && item.productTypeToppings.length > 0) {
          await this.productTypeToppingRepository.remove(
            item.productTypeToppings,
          );
        }
      }

      // Remove all receipt items
      if (receipt.receiptItems && receipt.receiptItems.length > 0) {
        await this.receiptItemRepository.remove(receipt.receiptItems);
      }
      console.log('receipt', receipt);

      // Remove the receipt itself
      await this.recieptRepository.remove(receipt);

      return receipt;
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
          'receiptItems.mealProduct',
        ],
      });

      if (!existingReceipt) {
        throw new HttpException('Receipt not found', HttpStatus.NOT_FOUND);
      }

      const oldReceiptItems = existingReceipt.receiptItems;
      const newReceiptItems = updateReceiptDto.receiptItems.map((itemDto) => {
        const receiptItem = new ReceiptItem();
        receiptItem.receiptItemId = itemDto.receiptItemId;
        receiptItem.quantity = itemDto.quantity;
        receiptItem.product = itemDto.product;
        receiptItem.productType = itemDto.productType;
        receiptItem.sweetnessLevel = itemDto.sweetnessLevel;
        receiptItem.receiptSubTotal = itemDto.receiptSubTotal;
        receiptItem.productTypeToppings =
          itemDto.productTypeToppings?.map((toppingDto) => {
            const productTypeTopping = new ProductTypeTopping();
            productTypeTopping.productType = new ProductType();
            productTypeTopping.productType.productTypeId =
              toppingDto.productTypeId;
            productTypeTopping.topping = toppingDto.topping;
            productTypeTopping.quantity = toppingDto.quantity;
            return productTypeTopping;
          }) || [];
        return receiptItem;
      });

      const removedItems = oldReceiptItems.filter(
        (oldItem) =>
          !newReceiptItems.find(
            (newItem) => newItem.receiptItemId === oldItem.receiptItemId,
          ),
      );

      const updatedItems = newReceiptItems.filter((newItem) =>
        oldReceiptItems.find(
          (oldItem) => oldItem.receiptItemId === newItem.receiptItemId,
        ),
      );

      const addedItems = newReceiptItems.filter(
        (newItem) =>
          !oldReceiptItems.find(
            (oldItem) => oldItem.receiptItemId === newItem.receiptItemId,
          ),
      );

      if (existingReceipt.receiptStatus === 'เลี้ยงรับรอง') {
        // Handle removed items
        for (const removedItem of removedItems) {
          if (removedItem.mealProduct) {
            const mealProduct = await this.mealProductRepository.findOne({
              where: { mealProductId: removedItem.mealProduct.mealProductId },
              relations: ['receiptItems'],
            });

            if (mealProduct) {
              mealProduct.quantity -= removedItem.quantity;
              if (mealProduct.quantity < 0) mealProduct.quantity = 0;

              mealProduct.receiptItems = mealProduct.receiptItems.filter(
                (item) => item.receiptItemId !== removedItem.receiptItemId,
              );
              await this.mealProductRepository.save(mealProduct);
            }
          }
        }

        // Handle updated items
        for (const updatedItem of updatedItems) {
          const oldItem = oldReceiptItems.find(
            (old) => old.receiptItemId === updatedItem.receiptItemId,
          );
          if (oldItem && oldItem.mealProduct) {
            const mealProduct = await this.mealProductRepository.findOne({
              where: { mealProductId: oldItem.mealProduct.mealProductId },
            });

            if (mealProduct) {
              const quantityDifference =
                updatedItem.quantity - oldItem.quantity;

              mealProduct.quantity += quantityDifference;

              if (mealProduct.quantity < 0) mealProduct.quantity = 0;

              await this.mealProductRepository.save(mealProduct);
            }
          }
        }

        // Handle added items
        for (const addedItem of addedItems) {
          const mealProduct = await this.mealProductRepository.findOne({
            where: { product: { productId: addedItem.product.productId } },
            relations: ['receiptItems'],
          });

          if (mealProduct) {
            mealProduct.quantity += addedItem.quantity;

            if (
              !mealProduct.receiptItems.some(
                (item) => item.receiptItemId === addedItem.receiptItemId,
              )
            ) {
              mealProduct.receiptItems.push(addedItem);
              await this.mealProductRepository.save(mealProduct);
            }
          }
        }
      }

      existingReceipt.receiptItems = newReceiptItems;
      existingReceipt.receiptTotalPrice = newReceiptItems.reduce(
        (acc, item) => acc + parseFloat(item.receiptSubTotal.toString()),
        0,
      );
      existingReceipt.receiptNetPrice = existingReceipt.receiptTotalPrice;

      return await this.recieptRepository.save(existingReceipt);
    } catch (error) {
      this.logger.error('Error updating receipt:', error.stack);
      throw new HttpException(
        'Failed to update receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSumByPaymentMethod(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const today = new Date();

    if (!startDate) {
      startDate = today.toISOString().split('T')[0];
    }

    if (!endDate) {
      today.setDate(today.getDate() + 1);
      endDate = today.toISOString().split('T')[0];
    } else {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      endDate = adjustedEndDate.toISOString().split('T')[0];
    }

    const coffeeSum = await this.recieptRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.receiptTotalPrice)', 'totalPrice')
      .where('receipt.receiptType = :coffeeType', { coffeeType: 'ร้านกาแฟ' })
      .andWhere('receipt.receiptStatus != :cancelStatus', {
        cancelStatus: 'cancel',
      })
      .andWhere(
        'receipt.createdDate >= :startDate AND receipt.createdDate < :endDate',
        {
          startDate: startDate,
          endDate: endDate,
        },
      )
      .andWhere('receipt.paymentMethod = :paymentMethod', {
        paymentMethod: 'cash',
      })
      .getRawOne();

    const coffeeQRCodeSum = await this.recieptRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.receiptTotalPrice)', 'totalPrice')
      .where('receipt.receiptType = :coffeeType', { coffeeType: 'ร้านกาแฟ' })
      .andWhere('receipt.receiptStatus != :cancelStatus', {
        cancelStatus: 'cancel',
      })
      .andWhere(
        'receipt.createdDate >= :startDate AND receipt.createdDate < :endDate',
        {
          startDate: startDate,
          endDate: endDate,
        },
      )
      .andWhere('receipt.paymentMethod = :paymentMethod', {
        paymentMethod: 'qrcode',
      })
      .getRawOne();

    const foodSum = await this.recieptRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.receiptTotalPrice)', 'totalPrice')
      .where('receipt.receiptType = :foodType', { foodType: 'ร้านข้าว' })
      .andWhere('receipt.receiptStatus != :cancelStatus', {
        cancelStatus: 'cancel',
      })
      .andWhere(
        'receipt.createdDate >= :startDate AND receipt.createdDate < :endDate',
        {
          startDate: startDate,
          endDate: endDate,
        },
      )
      .andWhere('receipt.paymentMethod = :paymentMethod', {
        paymentMethod: 'cash',
      })
      .getRawOne();

    const foodQRCodeSum = await this.recieptRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.receiptTotalPrice)', 'totalPrice')
      .where('receipt.receiptType = :foodType', { foodType: 'ร้านข้าว' })
      .andWhere('receipt.receiptStatus != :cancelStatus', {
        cancelStatus: 'cancel',
      })
      .andWhere(
        'receipt.createdDate >= :startDate AND receipt.createdDate < :endDate',
        {
          startDate: startDate,
          endDate: endDate,
        },
      )
      .andWhere('receipt.paymentMethod = :paymentMethod', {
        paymentMethod: 'qrcode',
      })
      .getRawOne();

    return {
      startDate,
      endDate,
      coffee: {
        cash: coffeeSum.totalPrice || 0,
        qrcode: coffeeQRCodeSum.totalPrice || 0,
      },
      food: {
        cash: foodSum.totalPrice || 0,
        qrcode: foodQRCodeSum.totalPrice || 0,
      },
    };
  }

  async getDailyReport(receiptType: string): Promise<{
    totalSales: number;
    totalDiscount: number;
    totalTransactions: number;
  }> {
    try {
      const totalSalesResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('SUM(receipt.receiptNetPrice)', 'totalSales')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .andWhere('receipt.receiptType = :receiptType', { receiptType })
        .andWhere('receipt.receiptStatus != :cancelStatus', {
          cancelStatus: 'cancel',
        })
        .getRawOne();
      const totalSales = totalSalesResult.totalSales || 0;

      const totalDiscountResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('SUM(receipt.receiptTotalDiscount)', 'totalDiscount')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .andWhere('receipt.receiptType = :receiptType', { receiptType })
        .andWhere('receipt.receiptStatus != :cancelStatus', {
          cancelStatus: 'cancel',
        })
        .getRawOne();
      const totalDiscount = totalDiscountResult.totalDiscount || 0;

      const totalTransactionsResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('COUNT(receipt.receiptId)', 'totalTransactions')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .andWhere('receipt.receiptType = :receiptType', { receiptType })
        .andWhere('receipt.receiptStatus != :cancelStatus', {
          cancelStatus: 'cancel',
        })
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
        start = moment().tz('Asia/Bangkok').startOf('day').toDate();
      }

      if (!(end instanceof Date) || isNaN(end.getTime())) {
        end = moment(start)
          .tz('Asia/Bangkok')
          .add(1, 'day')
          .endOf('day')
          .toDate();
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
        .andWhere('receipt.receiptStatus != :cancelStatus', {
          cancelStatus: 'cancel',
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
      this.logger.error('Error in getGroupedReceipts', error.stack);
      throw new HttpException(
        'Error while grouping receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCoffeeReceiptsWithCostAndDiscounts(start: Date, end: Date) {
    try {
      if (!(start instanceof Date) || isNaN(start.getTime())) {
        start = null;
      }
      if (!(end instanceof Date) || isNaN(end.getTime())) {
        end = new Date();
      }

      if (!start) {
        const earliestReceipt = await this.recieptRepository
          .createQueryBuilder('receipt')
          .select('MIN(receipt.createdDate)', 'min')
          .where('receipt.receiptType = :receiptType', {
            receiptType: 'ร้านกาแฟ',
          })
          .andWhere('receipt.receiptStatus != :cancelStatus', {
            cancelStatus: 'cancel',
          })
          .getRawOne();

        start = earliestReceipt ? new Date(earliestReceipt.min) : new Date(0);
      }

      if (!end) {
        end = new Date();
      }

      const startDate = moment(start)
        .tz('Asia/Bangkok')
        .startOf('day')
        .toISOString();
      const endDate = moment(end).tz('Asia/Bangkok').endOf('day').toISOString();

      this.logger.log(`Querying receipts from ${startDate} to ${endDate}`);
      const receipts = await this.recieptRepository
        .createQueryBuilder('receipt')
        .where('receipt.createdDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .andWhere('receipt.receiptType = :receiptType', {
          receiptType: 'ร้านกาแฟ',
        })
        .andWhere('receipt.receiptStatus != :cancelStatus', {
          cancelStatus: 'cancel',
        })
        .getMany();

      this.logger.log(`Found ${receipts.length} receipts`);

      const importIngredients = await this.importIngredientRepository
        .createQueryBuilder('importingredient')
        .where('importingredient.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .andWhere('importingredient.importStoreType = :storeType', {
          storeType: '',
        })
        .getMany();

      this.logger.log(`Found ${importIngredients.length} import ingredients`);

      let totalCost = 0;
      let totalDiscount = 0;
      let totalSales = 0;
      const totalOrders = receipts.length;

      importIngredients.forEach((ingredient) => {
        this.logger.log(`Adding ingredient total: ${ingredient.total}`);
        totalCost += ingredient.total;
      });

      receipts.forEach((receipt) => {
        this.logger.log(
          `Receipt Net Price: ${receipt.receiptNetPrice}, Discount: ${receipt.receiptTotalDiscount}`,
        );
        totalSales += receipt.receiptNetPrice;
        totalDiscount += receipt.receiptTotalDiscount;
      });

      this.logger.log(`Calculated total cost: ${totalCost}`);
      this.logger.log(`Calculated total sales: ${totalSales}`);
      this.logger.log(`Calculated total discount: ${totalDiscount}`);

      return {
        totalSales,
        totalCost,
        totalDiscount,
        totalOrders,
      };
    } catch (error) {
      this.logger.error(
        'Error in getCoffeeReceiptsWithCostAndDiscounts',
        error.stack,
      );
      throw new HttpException(
        'Error while grouping coffee receipts with cost and discounts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllProductsUsageByDateRangeAndReceiptType(
    receiptType: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      if (!startDate || !endDate) {
        const dates = await this.recieptItemRepository
          .createQueryBuilder('receiptItem')
          .select('MIN(reciept.createdDate)', 'minDate')
          .addSelect('MAX(reciept.createdDate)', 'maxDate')
          .leftJoin('receiptItem.reciept', 'reciept')
          .getRawOne();

        if (!startDate) {
          startDate = new Date(dates.minDate);
        }

        if (!endDate) {
          endDate = new Date(dates.maxDate);
          endDate.setDate(endDate.getDate() + 1);
        }
      }

      const productsUsage = await this.recieptItemRepository
        .createQueryBuilder('receiptItem')
        .leftJoinAndSelect('receiptItem.product', 'product')
        .leftJoinAndSelect('receiptItem.reciept', 'reciept')
        .leftJoinAndSelect('receiptItem.productType', 'productType')
        .where('reciept.createdDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .andWhere('reciept.receiptType = :receiptType', { receiptType })
        .getMany();

      const productSummary = productsUsage.reduce((summary, receiptItem) => {
        const key = `${receiptItem.product.productId}-${receiptItem.productType.productTypeId}`;
        if (!summary[key]) {
          summary[key] = {
            productName: receiptItem.product.productName,
            productTypeName: receiptItem.productType.productTypeName,
            usageCount: 0,
            totalQuantity: 0,
          };
        }
        summary[key].usageCount += 1;
        summary[key].totalQuantity += Number(receiptItem.quantity);
        return summary;
      }, {});

      const result = Object.values(productSummary);

      return {
        productsUsage: result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to find products usage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecieptIn1Day(typeOfStore: string): Promise<Reciept[]> {
    console.log('typeOfStore', typeOfStore);

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
      order: { receiptId: 'desc' }, // Order by the creation date in descending order
    });
  }

  // getRecieptCateringIn24Hours
  async getRecieptCateringIn24Hours(): Promise<Reciept[]> {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() - 24 * 60 * 60000); // 24 hours in milliseconds
    const endDate = new Date(currentDate.getTime());
    return await this.recieptRepository.find({
      where: {
        createdDate: Between(startDate, endDate),
        receiptStatus: 'unpaid',
        receiptType: 'ร้านจัดเลี้ยง',
      },
      relations: [
        'receiptItems',
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

  async generateIngredientUsageReport(startDate: Date, endDate: Date) {
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
      withDeleted: true,
    });

    const ingredientUsage: Record<
      string,
      { ingredientName: string; quantity: number; unit: string }
    > = {};

    for (const receipt of receipts) {
      for (const receiptItem of receipt.receiptItems) {
        let productType = receiptItem.productType;
        const receiptItem_ = await this.recieptItemRepository.findOne({
          where: { receiptItemId: receiptItem.receiptItemId },
          relations: [
            'productType',
            'productType.recipes',
            'productType.recipes.ingredient',
          ],
        });
        console.log('receiptItem_', receiptItem_);

        // If productType is null, fetch it with the withDeleted option
        if (!productType) {
          productType = await this.productTypeRepository.findOne({
            where: { productTypeId: receiptItem_.productType.productTypeId },
            withDeleted: true,
            relations: [
              'recipes',
              'recipes.ingredient',
              'product',
              'product.category',
            ],
          });
        }

        const product = await this.productRepository.findOne({
          where: { productId: productType.productTypeId },
          withDeleted: true,
          relations: [
            'category',
            'productTypes',
            'productTypes.recipes',
            'productTypes.recipes.ingredient',
          ],
        });

        for (const recipe of productType.recipes) {
          const ingredient = recipe.ingredient;
          const quantityUsed =
            recipe.quantity * parseFloat(receiptItem.quantity + '');

          if (ingredientUsage[ingredient.ingredientId]) {
            ingredientUsage[ingredient.ingredientId].quantity += quantityUsed;
          } else {
            ingredientUsage[ingredient.ingredientId] = {
              ingredientName: ingredient.ingredientName,
              quantity: quantityUsed,
              unit: ingredient.ingredientUnit,
            };
          }
        }
      }
    }

    const formattedResult = {
      ingredients: Object.values(ingredientUsage).reduce(
        (result, ingredient) => {
          const existingIngredient = result.find(
            (item) => item.ingredientName === ingredient.ingredientName,
          );
          if (existingIngredient) {
            existingIngredient.quantity += ingredient.quantity;
          } else {
            result.push(ingredient);
          }
          return result;
        },
        [],
      ),
    };

    return formattedResult;
  }
  async generateSalesReport(date?: Date): Promise<any[]> {
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0); // ตั้งค่าชั่วโมงให้เป็น 00:00:00

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); // จบที่ 24 ชั่วโมงถัดไป

    const results = [];

    for (let i = 0; i < 24; i += 2) {
      const startHour = new Date(startDate);
      startHour.setHours(i, 0, 0, 0);
      const endHour = new Date(startHour);
      endHour.setHours(i + 2, 0, 0, 0);

      const sales = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('SUM(receipt.receiptTotalPrice)', 'totalSales')
        .where(
          'receipt.createdDate >= :startHour AND receipt.createdDate < :endHour',
          { startHour, endHour },
        )
        .getRawOne();

      results.push({
        timeSlot: `${i}:00 - ${i + 2}:00`,
        totalSales: sales.totalSales ? parseFloat(sales.totalSales) : 0,
      });
    }

    return results;
  }

  // async getReceipts(
  //   page: number,
  //   limit: number,
  //   search: string,
  // ): Promise<{ data: Reciept[]; total: number }> {
  //   const whereCondition = search
  //     ? { receiptItem: { receiptItemId: Like(`%${search}%`) } }
  //     : {};
  //   const [data, total] = await this.recieptRepository.findAndCount({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     // where: whereCondition,
  //     relations: [
  //       'user',
  //       'customer',
  //       'productTypes',
  //       'product',
  //       'productTypeTopping',
  //       'topping',
  //       'receiptItem ',
  //       'ingredient',
  //       'receiptPromotion',
  //       'importingredient',
  //       'recipe',
  //       'checkingredient',
  //       'Checkingredientitem',
  //     ],
  //   });

  //   return { data, total };
  // }
  async generateReport(startDate?: Date, endDate?: Date) {
    try {
      console.log('Generating report...');

      // กำหนดค่าเริ่มต้นสำหรับวันที่
      const now = new Date();
      const defaultStartDate = new Date(now.setHours(0, 0, 0, 0));
      const defaultEndDate = new Date(now.setHours(23, 59, 59, 999));

      startDate = startDate ? new Date(startDate) : defaultStartDate;
      endDate = endDate ? new Date(endDate) : defaultEndDate;

      console.log(
        `Using date range: ${startDate.toISOString()} - ${endDate.toISOString()}`,
      );

      // ดึงข้อมูลแคชเชียร์ที่ปิดแล้ว
      const cashiers = await this.cashierRepository.find({
        relations: ['openedBy', 'closedBy'],
        where: {
          closedDate: Not(IsNull()),
        },
        order: { closedDate: 'DESC' },
      });

      console.log(`Found ${cashiers.length} closed cashiers`);

      // ดึงข้อมูลใบเสร็จ
      const receipts = await this.recieptRepository.find({
        where: {
          receiptStatus: 'paid',
        },
      });

      console.log(`Found ${receipts.length} paid receipts`);

      // แยกรายงานตามประเภทร้าน
      const coffeeReportData = [];
      const riceReportData = [];

      for (const cashier of cashiers) {
        // กรองใบเสร็จที่เกี่ยวข้องกับแคชเชียร์นี้
        const cashierReceipts = receipts.filter(
          (receipt) =>
            receipt.createdDate >= cashier.createdDate &&
            receipt.createdDate <= cashier.closedDate,
        );

        // แยกตามวิธีการชำระเงิน
        const cashReceipts = cashierReceipts.filter(
          (r) => r.paymentMethod === 'cash',
        );
        const qrcodeReceipts = cashierReceipts.filter(
          (r) => r.paymentMethod === 'qrcode',
        );

        // คำนวณยอดรวม
        const cashTotal = cashReceipts.reduce(
          (sum, r) => sum + Number(r.receiptNetPrice || 0),
          0,
        );
        const qrcodeTotal = qrcodeReceipts.reduce(
          (sum, r) => sum + Number(r.receiptNetPrice || 0),
          0,
        );

        const reportItem = {
          cashierId: cashier.cashierId,
          openedDate: cashier.createdDate,
          closedDate: cashier.closedDate,
          cashierAmount: cashier.cashierAmount,
          closedAmount: cashier.closedAmount,
          openedBy: cashier.openedBy?.userName || 'Unknown',
          closedBy: cashier.closedBy?.userName || 'Unknown',
          cash: cashReceipts.map((r) => ({
            saleTime: r.createdDate,
            totalPrice: r.receiptTotalPrice,
            netPrice: r.receiptNetPrice,
            change: r.change,
          })),
          qrcode: qrcodeReceipts.map((r) => ({
            saleTime: r.createdDate,
            totalPrice: r.receiptTotalPrice,
            netPrice: r.receiptNetPrice,
            change: r.change,
          })),
          cashTotal: Number(cashTotal.toFixed(2)),
          qrcodeTotal: Number(qrcodeTotal.toFixed(2)),
          totalSales: Number((cashTotal + qrcodeTotal).toFixed(2)),
        };

        // จัดกลุ่มตามประเภทร้าน
        if (cashier.type === 'coffee') {
          coffeeReportData.push(reportItem);
        } else if (cashier.type === 'rice') {
          riceReportData.push(reportItem);
        }

        console.log(
          `Processed cashier ${cashier.cashierId} (${cashier.type}): Cash: ${cashTotal}, QR: ${qrcodeTotal}`,
        );
      }

      // คำนวณยอดรวมทั้งหมด
      const totals = {
        coffee: {
          totalCash: coffeeReportData.reduce((sum, r) => sum + r.cashTotal, 0),
          totalQR: coffeeReportData.reduce((sum, r) => sum + r.qrcodeTotal, 0),
          total: coffeeReportData.reduce((sum, r) => sum + r.totalSales, 0),
        },
        rice: {
          totalCash: riceReportData.reduce((sum, r) => sum + r.cashTotal, 0),
          totalQR: riceReportData.reduce((sum, r) => sum + r.qrcodeTotal, 0),
          total: riceReportData.reduce((sum, r) => sum + r.totalSales, 0),
        },
      };

      return {
        startDate,
        endDate,
        coffee: {
          shifts: coffeeReportData,
          totals: totals.coffee,
        },
        rice: {
          shifts: riceReportData,
          totals: totals.rice,
        },
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw new HttpException(
        'Failed to generate report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
