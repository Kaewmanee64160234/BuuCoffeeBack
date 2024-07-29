import { Module } from '@nestjs/common';
import { ExportingredientitemsService } from './exportingredientitems.service';
import { ExportingredientitemsController } from './exportingredientitems.controller';

@Module({
  controllers: [ExportingredientitemsController],
  providers: [ExportingredientitemsService]
})
export class ExportingredientitemsModule {}
