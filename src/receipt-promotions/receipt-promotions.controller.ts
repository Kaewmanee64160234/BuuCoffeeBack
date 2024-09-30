import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReceiptPromotionsService } from './receipt-promotions.service';
import { CreateReceiptPromotionDto } from './dto/create-receipt-promotion.dto';
import { UpdateReceiptPromotionDto } from './dto/update-receipt-promotion.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('receipt-promotions')
export class ReceiptPromotionsController {
  constructor(
    private readonly receiptPromotionsService: ReceiptPromotionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  create(@Body() createReceiptPromotionDto: CreateReceiptPromotionDto) {
    return this.receiptPromotionsService.create(createReceiptPromotionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  findAll() {
    return this.receiptPromotionsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  findOne(@Param('id') id: string) {
    return this.receiptPromotionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  update(
    @Param('id') id: string,
    @Body() updateReceiptPromotionDto: UpdateReceiptPromotionDto,
  ) {
    return this.receiptPromotionsService.update(+id, updateReceiptPromotionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  remove(@Param('id') id: string) {
    return this.receiptPromotionsService.remove(+id);
  }
}
