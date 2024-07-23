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
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
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
    @InjectRepository(Importingredient)
    private importIngredientRepository: Repository<Importingredient>,
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
      let totalPoints = 0;

      for (const receiptItemDto of createRecieptDto.receiptItems) {
        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity <= 0) {
          throw new HttpException(
            'Invalid quantity value',
            HttpStatus.BAD_REQUEST,
          );
        }
        console.log('Product Type:', receiptItemDto);

        const product = await this.productRepository.findOne({
          where: { productId: receiptItemDto.product.productId },
          relations: [
            'category',
            'productTypes',
            'productTypes.recipes',
            'productTypes.recipes.ingredient',
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

        // Ensure every productType has recipes
        if (!productType.recipes || productType.recipes.length === 0) {
          throw new HttpException(
            'Product Type is missing recipes',
            HttpStatus.BAD_REQUEST,
          );
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
          product.category.haveTopping &&
          receiptItemDto.productTypeToppings.length > 0
        ) {
          console.log(
            'Product topping length:',
            receiptItemDto.productTypeToppings.length,
          );
          const productTypeToppings = [];
          for (let i = 0; i < receiptItemDto.productTypeToppings.length; i++) {
            console.log(
              'Topping name:',
              receiptItemDto.productTypeToppings[i].topping.toppingName,
            );
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

            console.log('Found Topping Product Type:', toppingProductType);
            if (!toppingProductType) {
              throw new HttpException(
                'Topping Product Type not found',
                HttpStatus.NOT_FOUND,
              );
            }

            // Ensure every topping productType has recipes
            if (
              !toppingProductType.recipes ||
              toppingProductType.recipes.length === 0
            ) {
              throw new HttpException(
                'Topping Product Type is missing recipes',
                HttpStatus.BAD_REQUEST,
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

          // Add base product price and product type price only once per receipt item
          await this.recieptItemRepository.save(recieptItemSave);
        }

        // Calculate points if the product has countingPoint = true
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

      // Update customer points if customer exists
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
      console.log('====================================');
      console.log(recipt);
      console.log('====================================');
      await this.updateIngredientStock(recipt.receiptItems);

      return recipt;
    } catch (error) {
      console.error(error);
      this.logger.error('Error creating receipt', error.stack);
      throw new HttpException(
        'Error creating receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async updateIngredientStock(receiptItems: ReceiptItem[]) {
    for (const receiptItemDto of receiptItems) {
      // Fetch the receipt item and related entities
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
        //  cutting stock from quantity
        console.log('receiptItem', receiptItem);

        const product = await this.productRepository.findOne({
          where: { productId: receiptItemDto.product.productId },
          relations: [
            'category',
            'productTypes',
            'productTypes.recipes',
            'productTypes.recipes.ingredient',
          ],
        });
        const ingredient = product.productTypes[0].recipes[0].ingredient;

        if (ingredient) {
          ingredient.ingredientRemining -= receiptItemDto.quantity;
          ingredient.ingredientQuantityInStock -= receiptItemDto.quantity;
          ingredient.ingredientRemining = Math.max(
            0,
            ingredient.ingredientRemining,
          );
          console.log('ingerdiam', ingredient);

          await this.ingredientRepository.save(ingredient);
        }
      } else {
        // Track ingredients processed for this receipt item
        const processedIngredients = new Set<number>();

        // Process the productTypeToppings
        for (const productTypeTopping of receiptItem.productTypeToppings) {
          if (
            productTypeTopping.productType &&
            productTypeTopping.productType.recipes
          ) {
            for (const recipe of productTypeTopping.productType.recipes) {
              const ingredient = recipe.ingredient;
              if (
                ingredient &&
                !processedIngredients.has(ingredient.ingredientId)
              ) {
                processedIngredients.add(ingredient.ingredientId);

                const oldRemaining = ingredient.ingredientRemining;
                ingredient.ingredientRemining = Math.round(
                  ingredient.ingredientRemining,
                );
                ingredient.ingredientRemining +=
                  receiptItemDto.quantity * recipe.quantity;

                console.log(
                  `Updating ingredient: ${ingredient.ingredientName}`,
                );
                console.log(`Old remaining: ${oldRemaining}`);
                console.log(
                  `Usage: ${receiptItemDto.quantity * recipe.quantity}`,
                );

                if (
                  ingredient.ingredientRemining >
                  ingredient.ingredientQuantityPerUnit
                ) {
                  ingredient.ingredientRemining -=
                    ingredient.ingredientQuantityPerUnit;
                  ingredient.ingredientQuantityInStock -= 1;
                  console.log(
                    `Stock reduced for ingredient: ${ingredient.ingredientName}`,
                  );
                }

                // Ensure remaining quantity does not go below zero
                ingredient.ingredientRemining = Math.max(
                  0,
                  ingredient.ingredientRemining,
                );

                // Allow stock quantity to go below zero
                console.log(`New remaining: ${ingredient.ingredientRemining}`);
                await this.ingredientRepository.save(ingredient);
              }
            }
          }
        }

        // Process the main product itself
        if (receiptItem.productType?.recipes) {
          for (const recipe of receiptItem.productType.recipes) {
            const ingredient = recipe.ingredient;
            if (
              ingredient &&
              !processedIngredients.has(ingredient.ingredientId)
            ) {
              processedIngredients.add(ingredient.ingredientId);

              const oldRemaining = ingredient.ingredientRemining;
              ingredient.ingredientRemining = Math.round(
                ingredient.ingredientRemining,
              );
              ingredient.ingredientRemining +=
                receiptItemDto.quantity * recipe.quantity;

              console.log(`Updating ingredient: ${ingredient.ingredientName}`);
              console.log(`Old remaining: ${oldRemaining}`);
              console.log(
                `Usage: ${receiptItemDto.quantity * recipe.quantity}`,
              );

              if (
                ingredient.ingredientRemining >
                ingredient.ingredientQuantityPerUnit
              ) {
                ingredient.ingredientRemining -=
                  ingredient.ingredientQuantityPerUnit;
                ingredient.ingredientQuantityInStock -= 1;
                console.log(
                  `Stock reduced for ingredient: ${ingredient.ingredientName}`,
                );
              }

              // Ensure remaining quantity does not go below zero
              ingredient.ingredientRemining = Math.max(
                0,
                ingredient.ingredientRemining,
              );

              // Allow stock quantity to go below zero
              console.log(`New remaining: ${ingredient.ingredientRemining}`);
              await this.ingredientRepository.save(ingredient);
            }
          }
        }
      }
    }
  }
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
      console.log('receiptItem', receiptItem);

      if (receiptItem.productTypeToppings.length == 0) {
        const productType = await this.productTypeRepository.findOne({
          where: { productTypeId: receiptItem.productType.productTypeId },
          relations: ['recipes', 'recipes.ingredient'],
        });
        const ingredient = productType.recipes[0].ingredient;

        if (ingredient) {
          ingredient.ingredientRemining =
            parseInt(ingredient.ingredientRemining.toString()) +
            parseInt(receiptItem.quantity.toString());
          ingredient.ingredientQuantityInStock =
            parseInt(ingredient.ingredientQuantityInStock.toString()) +
            parseInt(receiptItem.quantity.toString());
          await this.ingredientRepository.save(ingredient);
        }
      } else {
        const processedIngredients = new Set<number>();

        for (const productTypeTopping of receiptItem.productTypeToppings) {
          if (
            productTypeTopping.productType &&
            productTypeTopping.productType.recipes
          ) {
            for (const recipe of productTypeTopping.productType.recipes) {
              const ingredient = recipe.ingredient;
              if (
                ingredient &&
                !processedIngredients.has(ingredient.ingredientId)
              ) {
                processedIngredients.add(ingredient.ingredientId);

                ingredient.ingredientRemining =
                  parseInt(ingredient.ingredientRemining.toString()) -
                  parseInt(
                    (receiptItemDto.quantity * recipe.quantity).toString(),
                  );

                if (ingredient.ingredientRemining < 0) {
                  ingredient.ingredientRemining = parseInt(
                    (
                      ingredient.ingredientRemining +
                      ingredient.ingredientQuantityPerUnit
                    ).toString(),
                  );
                  ingredient.ingredientQuantityInStock = parseInt(
                    (ingredient.ingredientQuantityInStock + 1).toString(),
                  );
                }

                await this.ingredientRepository.save(ingredient);
              }
            }
          }
        }

        if (receiptItem.productType?.recipes) {
          for (const recipe of receiptItem.productType.recipes) {
            const ingredient = recipe.ingredient;
            if (
              ingredient &&
              !processedIngredients.has(ingredient.ingredientId)
            ) {
              processedIngredients.add(ingredient.ingredientId);

              ingredient.ingredientRemining =
                parseInt(ingredient.ingredientRemining.toString()) -
                parseInt(
                  (receiptItemDto.quantity * recipe.quantity).toString(),
                );

              if (ingredient.ingredientRemining < 0) {
                ingredient.ingredientRemining = parseInt(
                  (
                    ingredient.ingredientRemining +
                    ingredient.ingredientQuantityPerUnit
                  ).toString(),
                );
                ingredient.ingredientQuantityInStock = parseInt(
                  (ingredient.ingredientQuantityInStock + 1).toString(),
                );
              }

              await this.ingredientRepository.save(ingredient);
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

      // Return the updated receipt with all relations
      const rec = await this.recieptRepository.findOne({
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
      await this.updateIngredientStock(rec.receiptItems);
      console.log(rec.receiptItems);
      return rec;
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
      .andWhere('receipt.receiptType = :receiptType', {
        receiptType: 'ร้านกาแฟ',
      })
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
        .getRawOne();
      const totalSales = totalSalesResult.totalSales || 0;

      const totalDiscountResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('SUM(receipt.receiptTotalDiscount)', 'totalDiscount')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .andWhere('receipt.receiptType = :receiptType', { receiptType })
        .getRawOne();
      const totalDiscount = totalDiscountResult.totalDiscount || 0;

      const totalTransactionsResult = await this.recieptRepository
        .createQueryBuilder('receipt')
        .select('COUNT(receipt.receiptId)', 'totalTransactions')
        .where('DATE(receipt.createdDate) = CURDATE()')
        .andWhere('receipt.receiptType = :receiptType', { receiptType })
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
          .getRawOne();

        start = earliestReceipt ? new Date(earliestReceipt.min) : new Date(0);
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
          receiptType: 'ร้านกาแฟ',
        })
        .getMany();

      const importIngredients = await this.importIngredientRepository
        .createQueryBuilder('importingredient')
        .where('importingredient.date BETWEEN :startDate AND :endDate', {
          startDate: moment(start)
            .tz('Asia/Bangkok')
            .startOf('day')
            .toISOString(),
          endDate: moment(end).tz('Asia/Bangkok').endOf('day').toISOString(),
        })
        .andWhere('importingredient.importStoreType = :storeType', {
          storeType: 'coffee',
        })
        .getMany();

      let totalCost = 0;
      let totalDiscount = 0;
      let totalSales = 0;
      const totalOrders = receipts.length;

      importIngredients.forEach((ingredient) => {
        totalCost += ingredient.total;
      });

      receipts.forEach((receipt) => {
        totalSales += receipt.receiptNetPrice;
        totalDiscount += receipt.receiptTotalDiscount;
      });

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
          endDate.setDate(endDate.getDate() + 1); // เพิ่มวันให้ endDate
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
    });

    const ingredientUsage: Record<
      string,
      { ingredientName: string; quantity: number; unit: string }
    > = {};

    receipts.forEach((receipt) => {
      receipt.receiptItems.forEach((receiptItem) => {
        const productType = receiptItem.productType;

        productType.recipes.forEach((recipe) => {
          const ingredient = recipe.ingredient;
          const quantityUsed = recipe.quantity * receiptItem.quantity;

          if (ingredientUsage[ingredient.ingredientId]) {
            ingredientUsage[ingredient.ingredientId].quantity += quantityUsed;
          } else {
            ingredientUsage[ingredient.ingredientId] = {
              ingredientName: ingredient.ingredientName,
              quantity: quantityUsed,
              unit: ingredient.ingredientUnit,
            };
          }
        });
      });
    });

    const formattedResult = {
      ingredients: Object.values(ingredientUsage),
    };

    return formattedResult;
  }
}
