import { HttpException, HttpStatus } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reciept } from './entities/reciept.entity';
import { Repository } from 'typeorm';
import { CreateProductTypeDto } from 'src/product-types/dto/create-product-type.dto';
import { CreateProductTypeToppingDto } from 'src/product-type-toppings/dto/create-product-type-topping.dto';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';

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
  ) {}

  async create(createRecieptDto: CreateRecieptDto) {
    try {
      // Create new receipt
      const newReciept = this.recieptRepository.create({
        receiptTotalPrice: createRecieptDto.receiptTotalPrice,
        receiptTotalDiscount: createRecieptDto.receiptTotalDiscount,
        receiptNetPrice: createRecieptDto.receiptNetPrice,
        receiptStatus: createRecieptDto.receiptStatus,
      });

      // Save new receipt to the database
      const recieptSave = await this.recieptRepository.save(newReciept);

      // Loop through each receipt item in the DTO
      for (const receiptItemDto of createRecieptDto.receiptItems) {
        const newRecieptItem = this.recieptItemRepository.create({
          reciept: recieptSave,
        });

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
              // console.log(
              //   topping.toppingPrice + '*' + productTypeToppingDto.quantity,
              // );
              // console.log('ราคาท็อปปิ้ง*จำนวนท็อปปิ้ง' + totalProductTopping);
            }
            totalProductTopping +=
              Number(productType.product.productPrice) +
              Number(productType.productTypePrice);
            // console.log(
            //   productType.product.productPrice +
            //     '+' +
            //     productType.productTypePrice,
            // );
            // console.log('รวมราคาตามประเภทร้อนเย็นปั่น' + totalProductTopping);
          } else {
            totalProductTopping += Number(productType.product.productPrice);
            // console.log(
            //   totalProductTopping + '+' + productType.product.productPrice,
            // );
            // console.log('ราคารวมท็อปปิ้ง+ราคารวมสินค้า' + totalProductTopping);
          }

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
        relations: ['receiptItems', 'receiptItems.productTypeToppings'],
      });
    } catch (error) {
      console.error(error);
      throw new Error('Error creating receipt');
    }
  }

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
