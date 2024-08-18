import { Test, TestingModule } from '@nestjs/testing';
import { SubInventoriesRiceService } from './sub-inventories-rice.service';

describe('SubInventoriesRiceService', () => {
  let service: SubInventoriesRiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubInventoriesRiceService],
    }).compile();

    service = module.get<SubInventoriesRiceService>(SubInventoriesRiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
