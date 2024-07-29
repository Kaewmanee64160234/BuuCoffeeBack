import { Test, TestingModule } from '@nestjs/testing';
import { ExportingredientsService } from './exportingredients.service';

describe('ExportingredientsService', () => {
  let service: ExportingredientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportingredientsService],
    }).compile();

    service = module.get<ExportingredientsService>(ExportingredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
