import { Test, TestingModule } from '@nestjs/testing';
import { MealIngredientsService } from './meal-ingredients.service';

describe('MealIngredientsService', () => {
  let service: MealIngredientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealIngredientsService],
    }).compile();

    service = module.get<MealIngredientsService>(MealIngredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
