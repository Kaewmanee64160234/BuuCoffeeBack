import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptPromotionsService } from './receipt-promotions.service';

describe('ReceiptPromotionsService', () => {
  let service: ReceiptPromotionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptPromotionsService],
    }).compile();

    service = module.get<ReceiptPromotionsService>(ReceiptPromotionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
