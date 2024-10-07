import { Test, TestingModule } from '@nestjs/testing';
import { MealIngredientsController } from './meal-ingredients.controller';
import { MealIngredientsService } from './meal-ingredients.service';

describe('MealIngredientsController', () => {
  let controller: MealIngredientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealIngredientsController],
      providers: [MealIngredientsService],
    }).compile();

    controller = module.get<MealIngredientsController>(
      MealIngredientsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
