import { Module } from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CashiersController } from './cashiers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Cashier } from './entities/cashier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cashier, User])],
  controllers: [CashiersController],
  providers: [CashiersService],
})
export class CashiersModule {}
