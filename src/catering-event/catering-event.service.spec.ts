import { Test, TestingModule } from '@nestjs/testing';
import { CateringEventService } from './catering-event.service';

describe('CateringEventService', () => {
  let service: CateringEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CateringEventService],
    }).compile();

    service = module.get<CateringEventService>(CateringEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
