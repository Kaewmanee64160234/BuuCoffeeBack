import { Test, TestingModule } from '@nestjs/testing';
import { ImportingredientsService } from './importingredients.service';

describe('ImportingredientsService', () => {
  let service: ImportingredientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportingredientsService],
    }).compile();

    service = module.get<ImportingredientsService>(ImportingredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
