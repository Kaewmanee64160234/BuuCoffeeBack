import { Test, TestingModule } from '@nestjs/testing';
import { RecieptService } from './reciept.service';

describe('RecieptService', () => {
  let service: RecieptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecieptService],
    }).compile();

    service = module.get<RecieptService>(RecieptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
