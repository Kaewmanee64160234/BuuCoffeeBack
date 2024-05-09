import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeToppingsController } from './product-type-toppings.controller';
import { ProductTypeToppingsService } from './product-type-toppings.service';

describe('ProductTypeToppingsController', () => {
  let controller: ProductTypeToppingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTypeToppingsController],
      providers: [ProductTypeToppingsService],
    }).compile();

    controller = module.get<ProductTypeToppingsController>(
      ProductTypeToppingsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
