import { Test, TestingModule } from '@nestjs/testing';
import { IngredientusagelogService } from './ingredientusagelog.service';

describe('IngredientusagelogService', () => {
  let service: IngredientusagelogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientusagelogService],
    }).compile();

    service = module.get<IngredientusagelogService>(IngredientusagelogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
