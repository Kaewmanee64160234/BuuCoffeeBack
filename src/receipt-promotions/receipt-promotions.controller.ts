import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReceiptPromotionsService } from './receipt-promotions.service';
import { CreateReceiptPromotionDto } from './dto/create-receipt-promotion.dto';
import { UpdateReceiptPromotionDto } from './dto/update-receipt-promotion.dto';

@Controller('receipt-promotions')
export class ReceiptPromotionsController {
  constructor(private readonly receiptPromotionsService: ReceiptPromotionsService) {}

  @Post()
  create(@Body() createReceiptPromotionDto: CreateReceiptPromotionDto) {
    return this.receiptPromotionsService.create(createReceiptPromotionDto);
  }

  @Get()
  findAll() {
    return this.receiptPromotionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptPromotionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReceiptPromotionDto: UpdateReceiptPromotionDto) {
    return this.receiptPromotionsService.update(+id, updateReceiptPromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptPromotionsService.remove(+id);
  }
}
