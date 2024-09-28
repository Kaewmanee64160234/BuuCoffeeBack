import { Module } from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CashiersController } from './cashiers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Cashier } from './entities/cashier.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cashier, User]), UsersModule],
  controllers: [CashiersController],
  providers: [CashiersService, RolesGuard],
})
export class CashiersModule {}
