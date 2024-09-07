import { Test, TestingModule } from '@nestjs/testing';
import { IngredientusagelogController } from './ingredientusagelog.controller';
import { IngredientusagelogService } from './ingredientusagelog.service';

describe('IngredientusagelogController', () => {
  let controller: IngredientusagelogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientusagelogController],
      providers: [IngredientusagelogService],
    }).compile();

    controller = module.get<IngredientusagelogController>(
      IngredientusagelogController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
