import { Test, TestingModule } from '@nestjs/testing';
import { CateringEventController } from './catering-event.controller';
import { CateringEventService } from './catering-event.service';

describe('CateringEventController', () => {
  let controller: CateringEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CateringEventController],
      providers: [CateringEventService],
    }).compile();

    controller = module.get<CateringEventController>(CateringEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
