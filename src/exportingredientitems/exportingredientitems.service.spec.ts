import { Test, TestingModule } from '@nestjs/testing';
import { ExportingredientitemsService } from './exportingredientitems.service';

describe('ExportingredientitemsService', () => {
  let service: ExportingredientitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportingredientitemsService],
    }).compile();

    service = module.get<ExportingredientitemsService>(ExportingredientitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
