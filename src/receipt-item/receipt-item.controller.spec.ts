import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptItemController } from './receipt-item.controller';
import { ReceiptItemService } from './receipt-item.service';

describe('ReceiptItemController', () => {
  let controller: ReceiptItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptItemController],
      providers: [ReceiptItemService],
    }).compile();

    controller = module.get<ReceiptItemController>(ReceiptItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
