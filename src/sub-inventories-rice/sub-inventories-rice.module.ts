import { Module } from '@nestjs/common';
import { SubInventoriesRiceService } from './sub-inventories-rice.service';
import { SubInventoriesRiceController } from './sub-inventories-rice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubInventoriesRice } from './entities/sub-inventories-rice.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubInventoriesRice]), UsersModule],
  controllers: [SubInventoriesRiceController],
  providers: [SubInventoriesRiceService],
  exports: [SubInventoriesRiceService],
})
export class SubInventoriesRiceModule {}
