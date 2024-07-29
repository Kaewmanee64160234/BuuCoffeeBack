import { Test, TestingModule } from '@nestjs/testing';
import { ExportingredientsController } from './exportingredients.controller';
import { ExportingredientsService } from './exportingredients.service';

describe('ExportingredientsController', () => {
  let controller: ExportingredientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportingredientsController],
      providers: [ExportingredientsService],
    }).compile();

    controller = module.get<ExportingredientsController>(ExportingredientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
