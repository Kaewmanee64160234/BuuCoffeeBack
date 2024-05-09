import { Test, TestingModule } from '@nestjs/testing';
import { ToppingsService } from './toppings.service';

describe('ToppingsService', () => {
  let service: ToppingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToppingsService],
    }).compile();

    service = module.get<ToppingsService>(ToppingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
