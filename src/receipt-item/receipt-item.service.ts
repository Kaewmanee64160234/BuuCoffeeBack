import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';
import { ReceiptItem } from './entities/receipt-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptItemService {
  constructor(
    @InjectRepository(ReceiptItem)
    private receiptItemRepository: Repository<ReceiptItem>,
  ) {}
  create(createReceiptItemDto: CreateReceiptItemDto) {
    try {
      if (
        isNaN(createReceiptItemDto.quantity) ||
        createReceiptItemDto.quantity < 0 ||
        createReceiptItemDto.quantity == null
      ) {
        createReceiptItemDto.quantity = 1; // ตั้งค่าเริ่มต้นให้เป็น 1 ถ้าค่าไม่ถูกต้อง
      }

      const newReceiptItem = new ReceiptItem();
      newReceiptItem.quantity = createReceiptItemDto.quantity;

      return this.receiptItemRepository.save(newReceiptItem);
    } catch (error) {
      throw new HttpException(
        'Failed to create receipt item',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll() {
    return `This action returns all receiptItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} receiptItem`;
  }

  update(id: number, updateReceiptItemDto: UpdateReceiptItemDto) {
    return `This action updates a #${id} receiptItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} receiptItem`;
  }
}
