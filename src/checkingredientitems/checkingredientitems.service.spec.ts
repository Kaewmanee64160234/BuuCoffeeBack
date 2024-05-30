import { Test, TestingModule } from '@nestjs/testing';
import { CheckingredientitemsService } from './checkingredientitems.service';

describe('CheckingredientitemsService', () => {
  let service: CheckingredientitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckingredientitemsService],
    }).compile();

    service = module.get<CheckingredientitemsService>(CheckingredientitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
