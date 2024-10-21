import { Test, TestingModule } from '@nestjs/testing';
import { MealProductsService } from './meal-products.service';

describe('MealProductsService', () => {
  let service: MealProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealProductsService],
    }).compile();

    service = module.get<MealProductsService>(MealProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
