import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesRiceDto } from './dto/create-sub-inventories-rice.dto';
import { UpdateSubInventoriesRiceDto } from './dto/update-sub-inventories-rice.dto';
import { SubInventoriesRice } from './entities/sub-inventories-rice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class SubInventoriesRiceService {
  constructor(
    @InjectRepository(SubInventoriesRice)
    private riceShopSubInventoryRepository: Repository<SubInventoriesRice>,
  ) {}
  create(createSubInventoriesRiceDto: CreateSubInventoriesRiceDto) {
    return 'This action adds a new subInventoriesRice';
  }

  async findAll(): Promise<any[]> {
    const subInventories = await this.riceShopSubInventoryRepository.find({
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
    return `This action returns a #${id} subInventoriesRice`;
  }

  update(id: number, updateSubInventoriesRiceDto: UpdateSubInventoriesRiceDto) {
    return `This action updates a #${id} subInventoriesRice`;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventoriesRice`;
  }

  async getSubInventoryRices(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: SubInventoriesRice[]; total: number }> {
    // Ensure the search term is valid for a numeric ID
    // const whereCondition: FindOptionsWhere<SubInventoriesCoffee> | undefined =
    //   search && !isNaN(Number(search)) // Check if search is a valid number
    //     ? { subInventoryId: Equal(Number(search)) } // Use Equal operator for number match
    //     : undefined;

    const [data, total] =
      await this.riceShopSubInventoryRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        // where: whereCondition,
      });

    return { data, total };
  }
}
