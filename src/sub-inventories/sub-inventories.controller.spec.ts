import { Test, TestingModule } from '@nestjs/testing';
import { SubInventoriesController } from './sub-inventories.controller';
import { SubInventoriesService } from './sub-inventories.service';

describe('SubInventoriesController', () => {
  let controller: SubInventoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubInventoriesController],
      providers: [SubInventoriesService],
    }).compile();

    controller = module.get<SubInventoriesController>(SubInventoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
