import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CateringEventService } from './catering-event.service';
import { CateringEventController } from './catering-event.controller';
import { CateringEvent } from './entities/catering-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CateringEvent])],
  controllers: [CateringEventController],
  providers: [CateringEventService],
  exports: [CateringEventService],
})
export class CateringEventModule {}
