import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptItemService } from './receipt-item.service';

describe('ReceiptItemService', () => {
  let service: ReceiptItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptItemService],
    }).compile();

    service = module.get<ReceiptItemService>(ReceiptItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
