import { Test, TestingModule } from '@nestjs/testing';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';

describe('SubInventoriesCoffeeService', () => {
  let service: SubInventoriesCoffeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubInventoriesCoffeeService],
    }).compile();

    service = module.get<SubInventoriesCoffeeService>(
      SubInventoriesCoffeeService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
