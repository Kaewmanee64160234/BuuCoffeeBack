import { Test, TestingModule } from '@nestjs/testing';
import { MealProductsController } from './meal-products.controller';
import { MealProductsService } from './meal-products.service';

describe('MealProductsController', () => {
  let controller: MealProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealProductsController],
      providers: [MealProductsService],
    }).compile();

    controller = module.get<MealProductsController>(MealProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
