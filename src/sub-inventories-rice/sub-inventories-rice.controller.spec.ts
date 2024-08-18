import { Test, TestingModule } from '@nestjs/testing';
import { SubInventoriesRiceController } from './sub-inventories-rice.controller';
import { SubInventoriesRiceService } from './sub-inventories-rice.service';

describe('SubInventoriesRiceController', () => {
  let controller: SubInventoriesRiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubInventoriesRiceController],
      providers: [SubInventoriesRiceService],
    }).compile();

    controller = module.get<SubInventoriesRiceController>(SubInventoriesRiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
