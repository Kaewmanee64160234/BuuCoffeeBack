import { Module } from '@nestjs/common';
import { ImportingredientitemsService } from './importingredientitems.service';
import { ImportingredientitemsController } from './importingredientitems.controller';

@Module({
  controllers: [ImportingredientitemsController],
  providers: [ImportingredientitemsService],
})
export class ImportingredientitemsModule {}
