import { Module } from '@nestjs/common';
import { ImportingredientitemsService } from './importingredientitems.service';
import { ImportingredientitemsController } from './importingredientitems.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ImportingredientitemsController],
  providers: [ImportingredientitemsService],
})
export class ImportingredientitemsModule {}
