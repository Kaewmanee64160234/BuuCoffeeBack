import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptPromotionsController } from './receipt-promotions.controller';
import { ReceiptPromotionsService } from './receipt-promotions.service';

describe('ReceiptPromotionsController', () => {
  let controller: ReceiptPromotionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptPromotionsController],
      providers: [ReceiptPromotionsService],
    }).compile();

    controller = module.get<ReceiptPromotionsController>(
      ReceiptPromotionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
