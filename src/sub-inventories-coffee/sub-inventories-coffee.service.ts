import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Equal } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Injectable()
export class SubInventoriesCoffeeService {
  constructor(
    @InjectRepository(SubInventoriesCoffee)
    private coffeeShopSubInventoryRepository: Repository<SubInventoriesCoffee>,
    // product
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    // ingredient
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
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

  // get inventory by product id
  // getInventoryCoffeeByProductId
  async getInventoryByProductId(productId: number) {
    // Select the appropriate repository based on store type
    console.log('productId', productId);

    const product = await this.productRepository.findOne({
      where: { productId: productId },
      relations: ['ingredient'],
    });

    const ingredient = await this.ingredientRepository.findOne({
      where: { ingredientId: product.ingredient.ingredientId },
    });

    const subInventory = await this.coffeeShopSubInventoryRepository.findOne({
      where: {
        ingredient: {
          ingredientId: ingredient.ingredientId,
        },
      },
    });

    if (!subInventory) {
      throw new Error('ไม่พบวัตถุดิบ'); // "Ingredient not found"
    }

    return subInventory;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventoriesCoffee`;
  }

  async getSubInventoryCoffees(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: SubInventoriesCoffee[]; total: number }> {
    // Ensure the search term is valid for a numeric ID
    // const whereCondition: FindOptionsWhere<SubInventoriesCoffee> | undefined =
    //   search && !isNaN(Number(search)) // Check if search is a valid number
    //     ? { subInventoryId: Equal(Number(search)) } // Use Equal operator for number match
    //     : undefined;

    const [data, total] =
      await this.coffeeShopSubInventoryRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        // where: whereCondition,
      });

    return { data, total };
  }
}
