import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubInventoriesCoffeeService {
  constructor(
    @InjectRepository(SubInventoriesCoffee)
    private coffeeShopSubInventoryRepository: Repository<SubInventoriesCoffee>,
  ) {}
  create(createSubInventoriesCoffeeDto: CreateSubInventoriesCoffeeDto) {
    return 'This action adds a new subInventoriesCoffee';
  }

  async findAll(): Promise<any[]> {
    const subInventories = await this.coffeeShopSubInventoryRepository.find({
      relations: ['ingredient', 'ingredient.importingredientitem'],
      order: { ingredient: { importingredientitem: { createdDate: 'DESC' } } },
    });

    return subInventories.map((subInventory) => {
      // Get the latest import ingredient item
      const latestImportItem = subInventory.ingredient.importingredientitem[0];
      let lastPrice = 0;
      // Calculate lastPrice based on the latest import's price and quantity
      if (latestImportItem.importType === 'box') {
        lastPrice = latestImportItem
          ? latestImportItem.unitPrice // Avoid division by zero
          : 0;
      } else {
        lastPrice = latestImportItem
          ? latestImportItem.unitPrice / latestImportItem.Quantity // Avoid division by zero
          : 0;
      }

      return {
        ...subInventory,
        lastPrice, // Add the calculated lastPrice
      };
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} subInventoriesCoffee`;
  }

  update(
    id: number,
    updateSubInventoriesCoffeeDto: UpdateSubInventoriesCoffeeDto,
  ) {
    return `This action updates a #${id} subInventoriesCoffee`;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventoriesCoffee`;
  }
}
