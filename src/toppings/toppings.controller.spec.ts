import { Test, TestingModule } from '@nestjs/testing';
import { ToppingsController } from './toppings.controller';
import { ToppingsService } from './toppings.service';

describe('ToppingsController', () => {
  let controller: ToppingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToppingsController],
      providers: [ToppingsService],
    }).compile();

    controller = module.get<ToppingsController>(ToppingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
