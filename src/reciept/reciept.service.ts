import { HttpException, HttpStatus } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reciept } from './entities/reciept.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Customer } from 'src/customers/entities/customer.entity';
import { CreateCustomerDto } from 'src/customers/dto/create-customer.dto';
import { Repository } from 'typeorm';
import { CreateProductTypeDto } from 'src/product-types/dto/create-product-type.dto';
import { CreateProductTypeToppingDto } from 'src/product-type-toppings/dto/create-product-type-topping.dto';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';

@Injectable()
export class RecieptService {
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

      const customer = createRecieptDto.customerId
        ? await this.customerRepository.findOne({
            where: { customerId: createRecieptDto.customerId },
          })
        : null;
      if (createRecieptDto.customerId && !customer) {
        throw new Error('Customer not found');
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

        const newRecieptItem = this.recieptItemRepository.create({
          quantity: receiptItemDto.quantity,
          reciept: recieptSave,
          sweetnessLevel: receiptItemDto.sweetnessLevel,
          receiptSubTotal: receiptItemDto.receiptSubTotal,
        });
        const recieptItemSave = await this.recieptItemRepository.save(
          newRecieptItem,
        );
        for (const productTypeToppingDto of receiptItemDto.productTypeToppings) {
          const productType = await this.productTypeRepository.findOne({
            where: { productTypeId: productTypeToppingDto.productTypeId },
            relations: ['product', 'product.category'],
          });

          const newProductTypeTopping =
            this.productTypeToppingRepository.create({
              quantity: productTypeToppingDto.quantity,
              productType: productType,
              receiptItem: recieptItemSave,
            });

          if (
            productType.product.category.haveTopping &&
            productTypeToppingDto.toppingId
          ) {
            const topping = await this.toppingRepository.findOne({
              where: { toppingId: productTypeToppingDto.toppingId },
            });
            newProductTypeTopping.topping = topping;
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

  // async updateStock(productType, quantity) {
  //   try {
  //     const product = await this.productRepository.findOne({
  //       where: { productId: productType.product.productId },
  //     });

  //     if (product) {
  //       product.productTypes.this.ingredieintRepository -= quantity; // ลดจำนวนวัตถุดิบในสต็อก
  //       await this.productRepository.save(product);
  //       console.log('อัปเดตจำนวนวัตถุดิบในสต็อก: ' + product.ingredieint);
  //     }
  //   } catch (error) {
  //     console.error('Error updating stock:', error);
  //   }
  // }

  findAll() {
    try {
      return this.recieptRepository.find();
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(id: number) {
    try {
      //find if not found throw error
      const reciept = await this.recieptRepository.findOne({
        where: { receiptId: id },
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
}
