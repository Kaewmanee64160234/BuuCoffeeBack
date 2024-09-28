import { Module } from '@nestjs/common';
import { CheckingredientitemsService } from './checkingredientitems.service';
import { CheckingredientitemsController } from './checkingredientitems.controller';
import { RolesGuard } from 'src/guards/roles.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CheckingredientitemsController],
  providers: [CheckingredientitemsService, RolesGuard],
})
export class CheckingredientitemsModule {}
