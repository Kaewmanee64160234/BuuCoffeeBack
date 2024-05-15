import { Injectable } from '@nestjs/common';
import { CreateReceiptPromotionDto } from './dto/create-receipt-promotion.dto';
import { UpdateReceiptPromotionDto } from './dto/update-receipt-promotion.dto';

@Injectable()
export class ReceiptPromotionsService {
  create(createReceiptPromotionDto: CreateReceiptPromotionDto) {
    return 'This action adds a new receiptPromotion';
  }

  findAll() {
    return `This action returns all receiptPromotions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} receiptPromotion`;
  }

  update(id: number, updateReceiptPromotionDto: UpdateReceiptPromotionDto) {
    return `This action updates a #${id} receiptPromotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} receiptPromotion`;
  }
}
