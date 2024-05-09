import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeToppingsService } from './product-type-toppings.service';

describe('ProductTypeToppingsService', () => {
  let service: ProductTypeToppingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductTypeToppingsService],
    }).compile();

    service = module.get<ProductTypeToppingsService>(ProductTypeToppingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
