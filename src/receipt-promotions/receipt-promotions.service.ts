import { Injectable } from '@nestjs/common';
import { CreateReceiptPromotionDto } from './dto/create-receipt-promotion.dto';
import { UpdateReceiptPromotionDto } from './dto/update-receipt-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceiptPromotion } from './entities/receipt-promotion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptPromotionsService {
  constructor(
    @InjectRepository(ReceiptPromotion)
    private receiptPromotionRepository: Repository<ReceiptPromotion>,
  ) {}

  findAll(): Promise<ReceiptPromotion[]> {
    return this.receiptPromotionRepository.find();
  }

  findOne(id: number): Promise<ReceiptPromotion> {
    return this.receiptPromotionRepository.findOneBy({ receiptPromId: id });
  }

  create(
    receiptPromotion: CreateReceiptPromotionDto,
  ): Promise<ReceiptPromotion> {
    return this.receiptPromotionRepository.save(receiptPromotion);
  }

  async update(
    id: number,
    receiptPromotion: UpdateReceiptPromotionDto,
  ): Promise<void> {
    await this.receiptPromotionRepository.update(id, receiptPromotion);
  }

  async remove(id: number): Promise<void> {
    await this.receiptPromotionRepository.delete(id);
  }
}
