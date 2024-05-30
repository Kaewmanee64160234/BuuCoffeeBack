import { Test, TestingModule } from '@nestjs/testing';
import { CheckingredientsController } from './checkingredients.controller';
import { CheckingredientsService } from './checkingredients.service';

describe('CheckingredientsController', () => {
  let controller: CheckingredientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckingredientsController],
      providers: [CheckingredientsService],
    }).compile();

    controller = module.get<CheckingredientsController>(
      CheckingredientsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
