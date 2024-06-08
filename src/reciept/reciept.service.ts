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
    private ingredieintRepository: Repository<Ingredient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createRecieptDto: CreateRecieptDto) {
    console.log(createRecieptDto);
    try {
      // Find the user by userId from userDto
      const user = await this.userRepository.findOne({
        where: { userId: createRecieptDto.userId }, // assuming the correct property name is 'id' in the user repository
      });
      console.log(user);
      if (user == null) {
        throw new Error('User not found');
      }

      // Find the user by userId from userDto
      const customer = await this.customerRepository.findOne({
        where: { customerId: createRecieptDto.customerId }, // assuming the correct property name is 'id' in the user repository
      });
      console.log(customer);
      if (!customer) {
        throw new Error('Customer not found');
      }

      let storeStatus = 'ร้านข้าว';
      if (user.userRole === 'coffee shop employee') {
        storeStatus = 'ร้านกาแฟ';
      }

      // Create new receipt
      const newReciept = this.recieptRepository.create({
        receiptTotalPrice: createRecieptDto.receiptTotalPrice,
        receiptTotalDiscount: createRecieptDto.receiptTotalDiscount,
        receiptNetPrice: createRecieptDto.receiptNetPrice,
        receiptStatus: createRecieptDto.receiptStatus,
        user: user,
        customer: customer,
        storeStatus: storeStatus,
      });

      // Save new receipt to the database
      const recieptSave = await this.recieptRepository.save(newReciept);
      // Loop through each receipt item in the DTO
      for (const receiptItemDto of createRecieptDto.receiptItems) {
        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity < 0) {
          receiptItemDto.quantity = 0;
        }

        receiptItemDto.quantity = receiptItemDto.quantity + 1;

        if (isNaN(receiptItemDto.quantity) || receiptItemDto.quantity < 0) {
          throw new Error('Invalid quantity value after increment');
        }
        const newRecieptItem = this.recieptItemRepository.create({
          quantity: receiptItemDto.quantity,
          reciept: recieptSave,
        });
        console.log(newRecieptItem);
        // Save the new receipt item to the database
        const recieptItemSave = await this.recieptItemRepository.save(
          newRecieptItem,
        );

        let totalProductTopping = 0;
        // Loop through each product type topping in the DTO
        for (const productTypeToppingDto of receiptItemDto.productTypeToppings) {
          const productType = await this.productTypeRepository.findOne({
            where: { productTypeId: productTypeToppingDto.productTypeId },
            relations: ['product', 'product.category'],
          });
          console.log(productType);
          console.log(productType.product.category);
          const newProductTypeTopping =
            this.productTypeToppingRepository.create({
              quantity: productTypeToppingDto.quantity,
              productType: productType,
              receiptItem: recieptItemSave,
            });

          if (productType.product.category.haveTopping) {
            if (productTypeToppingDto.toppingId) {
              const topping = await this.toppingRepository.findOne({
                where: { toppingId: productTypeToppingDto.toppingId },
              });
              newProductTypeTopping.topping = topping;
              totalProductTopping += Number(
                topping.toppingPrice * productTypeToppingDto.quantity,
              );
              ////////////////
              console.log(
                topping.toppingPrice + '*' + productTypeToppingDto.quantity,
              );
              console.log('ราคาท็อปปิ้ง*จำนวนท็อปปิ้ง' + totalProductTopping);
            }
            // totalProductTopping += Number(totalProductTopping);
            // //////////////////////////
            // console.log('รวมราคาท็อปปิ้ง' + totalProductTopping);
          } else {
            totalProductTopping += Number(productType.product.productPrice);
            //////////////////////////////
            console.log(
              totalProductTopping + '+' + productType.product.productPrice,
            );
            console.log('ราคารวมท็อปปิ้ง+ราคารวมสินค้า' + totalProductTopping);
          }
          // totalProductTopping +=
          //   Number(productType.product.productPrice) +
          //   Number(productType.productTypePrice);
          // ////////////////////////
          // console.log(
          //   productType.product.productPrice +
          //     '+' +
          //     productType.productTypePrice,
          // );
          // console.log('รวมราคาตามประเภทร้อนเย็นปั่น' + totalProductTopping);
          const productPrice = Number(productType.product.productPrice);
          const productTypePrice = Number(productType.productTypePrice);
          totalProductTopping += productPrice + productTypePrice;
          console.log('ราคาสินค้า: ' + productPrice);
          console.log(
            'ราคาแบบสินค้า (เช่น ร้อน เย็น ปั่น): ' + productTypePrice,
          );
          console.log('ราคารวม: ' + totalProductTopping);
          // Save the new product type topping to the database
          await this.productTypeToppingRepository.save(newProductTypeTopping);
        }

        // Update the receipt item subtotal
        newRecieptItem.receiptSubTotal = Number(totalProductTopping);
        await this.recieptItemRepository.save(newRecieptItem);

        newReciept.receiptTotalPrice =
          recieptSave.receiptTotalPrice + newRecieptItem.receiptSubTotal;
        newReciept.receiptTotalDiscount = recieptSave.receiptTotalDiscount;
        newReciept.receiptNetPrice =
          recieptSave.receiptTotalPrice - newReciept.receiptTotalDiscount;
      }

      // Save the final receipt to the database
      const receiptFinish = await this.recieptRepository.save(recieptSave);

      // Fetch the newly created receipt with relations
      return await this.recieptRepository.findOne({
        where: { receiptId: receiptFinish.receiptId },
        relations: [
          'receiptItems',
          'receiptItems.productTypeToppings',
          'user',
          'customer',
        ],
      });
    } catch (error) {
      console.error(error);
      throw new Error('Error creating receipt');
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
