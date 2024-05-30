import { Test, TestingModule } from '@nestjs/testing';
import { ImportingredientitemsController } from './importingredientitems.controller';
import { ImportingredientitemsService } from './importingredientitems.service';

describe('ImportingredientitemsController', () => {
  let controller: ImportingredientitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportingredientitemsController],
      providers: [ImportingredientitemsService],
    }).compile();

    controller = module.get<ImportingredientitemsController>(
      ImportingredientitemsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
