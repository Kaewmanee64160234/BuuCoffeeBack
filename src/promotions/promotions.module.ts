import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, ReceiptPromotion])],
  controllers: [PromotionsController],
  providers: [PromotionsService],
})
export class PromotionsModule {}
