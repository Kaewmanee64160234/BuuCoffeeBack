import { Test, TestingModule } from '@nestjs/testing';
import { CashiersController } from './cashiers.controller';
import { CashiersService } from './cashiers.service';

describe('CashiersController', () => {
  let controller: CashiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashiersController],
      providers: [CashiersService],
    }).compile();

    controller = module.get<CashiersController>(CashiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
