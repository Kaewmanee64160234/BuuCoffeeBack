import { Module } from '@nestjs/common';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';
import { SubInventoriesCoffeeController } from './sub-inventories-coffee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubInventoriesCoffee]), UsersModule],
  controllers: [SubInventoriesCoffeeController],
  providers: [SubInventoriesCoffeeService],
  exports: [SubInventoriesCoffeeService],
})
export class SubInventoriesCoffeeModule {}
