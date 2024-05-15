import { Injectable } from '@nestjs/common';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';

@Injectable()
export class ReceiptItemService {
  create(createReceiptItemDto: CreateReceiptItemDto) {
    return 'This action adds a new receiptItem';
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
