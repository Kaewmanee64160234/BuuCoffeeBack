import { Test, TestingModule } from '@nestjs/testing';
import { RecieptController } from './reciept.controller';
import { RecieptService } from './reciept.service';

describe('RecieptController', () => {
  let controller: RecieptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecieptController],
      providers: [RecieptService],
    }).compile();

    controller = module.get<RecieptController>(RecieptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
