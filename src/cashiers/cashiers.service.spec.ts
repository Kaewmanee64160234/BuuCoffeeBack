import { Test, TestingModule } from '@nestjs/testing';
import { CashiersService } from './cashiers.service';

describe('CashiersService', () => {
  let service: CashiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashiersService],
    }).compile();

    service = module.get<CashiersService>(CashiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
