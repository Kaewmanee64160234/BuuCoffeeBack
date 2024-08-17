import { Test, TestingModule } from '@nestjs/testing';
import { SubInventoriesService } from './sub-inventories.service';

describe('SubInventoriesService', () => {
  let service: SubInventoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubInventoriesService],
    }).compile();

    service = module.get<SubInventoriesService>(SubInventoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
