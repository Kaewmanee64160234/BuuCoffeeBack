import { Test, TestingModule } from '@nestjs/testing';
import { ImportingredientitemsService } from './importingredientitems.service';

describe('ImportingredientitemsService', () => {
  let service: ImportingredientitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportingredientitemsService],
    }).compile();

    service = module.get<ImportingredientitemsService>(
      ImportingredientitemsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
