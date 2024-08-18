import { Test, TestingModule } from '@nestjs/testing';
import { SubInventoriesCoffeeController } from './sub-inventories-coffee.controller';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';

describe('SubInventoriesCoffeeController', () => {
  let controller: SubInventoriesCoffeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubInventoriesCoffeeController],
      providers: [SubInventoriesCoffeeService],
    }).compile();

    controller = module.get<SubInventoriesCoffeeController>(SubInventoriesCoffeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
