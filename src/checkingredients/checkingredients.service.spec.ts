import { Test, TestingModule } from '@nestjs/testing';
import { CheckingredientsService } from './checkingredients.service';

describe('CheckingredientsService', () => {
  let service: CheckingredientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckingredientsService],
    }).compile();

    service = module.get<CheckingredientsService>(CheckingredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
