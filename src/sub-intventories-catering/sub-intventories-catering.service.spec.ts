import { Test, TestingModule } from '@nestjs/testing';
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';

describe('SubIntventoriesCateringService', () => {
  let service: SubIntventoriesCateringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubIntventoriesCateringService],
    }).compile();

    service = module.get<SubIntventoriesCateringService>(SubIntventoriesCateringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
