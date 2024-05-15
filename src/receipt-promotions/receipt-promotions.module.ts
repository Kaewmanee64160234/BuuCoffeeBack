import { Module } from '@nestjs/common';
import { ReceiptPromotionsService } from './receipt-promotions.service';
import { ReceiptPromotionsController } from './receipt-promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptPromotion } from './entities/receipt-promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReceiptPromotion])],
  controllers: [ReceiptPromotionsController],
  providers: [ReceiptPromotionsService],
})
export class ReceiptPromotionsModule {}
