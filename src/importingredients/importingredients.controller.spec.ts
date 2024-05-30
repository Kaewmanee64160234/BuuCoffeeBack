import { Test, TestingModule } from '@nestjs/testing';
import { ImportingredientsController } from './importingredients.controller';
import { ImportingredientsService } from './importingredients.service';

describe('ImportingredientsController', () => {
  let controller: ImportingredientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportingredientsController],
      providers: [ImportingredientsService],
    }).compile();

    controller = module.get<ImportingredientsController>(
      ImportingredientsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
