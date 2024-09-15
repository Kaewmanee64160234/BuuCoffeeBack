import { Test, TestingModule } from '@nestjs/testing';
import { SubIntventoriesCateringController } from './sub-intventories-catering.controller';
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';

describe('SubIntventoriesCateringController', () => {
  let controller: SubIntventoriesCateringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubIntventoriesCateringController],
      providers: [SubIntventoriesCateringService],
    }).compile();

    controller = module.get<SubIntventoriesCateringController>(
      SubIntventoriesCateringController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
