import { Module } from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CashiersController } from './cashiers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Cashier } from './entities/cashier.entity';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { UsersModule } from 'src/users/users.module';
import { CashierItem } from './entities/cashierItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cashier, User, CashierItem]),
    UsersModule,
  ],
  controllers: [CashiersController],
  providers: [CashiersService, PermissionsGuard],
})
export class CashiersModule {}
