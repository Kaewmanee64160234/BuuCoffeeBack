import { Test, TestingModule } from '@nestjs/testing';
import { ExportingredientitemsController } from './exportingredientitems.controller';
import { ExportingredientitemsService } from './exportingredientitems.service';

describe('ExportingredientitemsController', () => {
  let controller: ExportingredientitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportingredientitemsController],
      providers: [ExportingredientitemsService],
    }).compile();

    controller = module.get<ExportingredientitemsController>(ExportingredientitemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
