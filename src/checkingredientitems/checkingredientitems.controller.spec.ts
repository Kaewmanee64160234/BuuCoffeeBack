import { Test, TestingModule } from '@nestjs/testing';
import { CheckingredientitemsController } from './checkingredientitems.controller';
import { CheckingredientitemsService } from './checkingredientitems.service';

describe('CheckingredientitemsController', () => {
  let controller: CheckingredientitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckingredientitemsController],
      providers: [CheckingredientitemsService],
    }).compile();

    controller = module.get<CheckingredientitemsController>(
      CheckingredientitemsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
