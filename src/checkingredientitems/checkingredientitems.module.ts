import { Module } from '@nestjs/common';
import { CheckingredientitemsService } from './checkingredientitems.service';
import { CheckingredientitemsController } from './checkingredientitems.controller';

@Module({
  controllers: [CheckingredientitemsController],
  providers: [CheckingredientitemsService]
})
export class CheckingredientitemsModule {}
