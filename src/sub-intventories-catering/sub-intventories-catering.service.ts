import { Injectable } from '@nestjs/common';
import { CreateSubIntventoriesCateringDto } from './dto/create-sub-intventories-catering.dto';
import { UpdateSubIntventoriesCateringDto } from './dto/update-sub-intventories-catering.dto';
import { SubIntventoriesCatering } from './entities/sub-intventories-catering.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';

@Injectable()
export class SubIntventoriesCateringService {
  constructor(
    @InjectRepository(SubIntventoriesCatering)
    private cateringShopSubInventoryRepository: Repository<SubIntventoriesCatering>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(SubInventoriesCoffee)
    private coffeeShopSubInventoryRepository: Repository<SubInventoriesCoffee>,
    @InjectRepository(SubInventoriesRice)
    private riceShopSubInventoryRepository: Repository<SubInventoriesRice>,
  ) {}
  async create(
    createSubIntventoriesCateringDto: CreateSubIntventoriesCateringDto,
  ) {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: createSubIntventoriesCateringDto.ingredientId },
      });
      if (!ingredient) {
        throw new Error('Ingredient not found');
      }
      const subInventory = new SubIntventoriesCatering();
      subInventory.ingredient = ingredient;
      subInventory.quantity = createSubIntventoriesCateringDto.quantity;
      subInventory.type = createSubIntventoriesCateringDto.type;

      if (subInventory.type === 'coffee') {
        const subInvenCoffee =
          await this.coffeeShopSubInventoryRepository.findOne({
            where: { ingredient: { ingredientId: ingredient.ingredientId } },
          });
        if (subInvenCoffee) {
          subInvenCoffee.quantity -= subInventory.quantity;
          await this.coffeeShopSubInventoryRepository.save(subInvenCoffee);
        } else {
          throw new Error('Coffee not found');
        }
      } else {
        const subInvenRice = await this.riceShopSubInventoryRepository.findOne({
          where: { ingredient: { ingredientId: ingredient.ingredientId } },
        });
        if (subInvenRice) {
          subInvenRice.quantity -= subInventory.quantity;
          await this.riceShopSubInventoryRepository.save(subInvenRice);
        } else {
          throw new Error('Rice not found');
        }
      }
      return await this.cateringShopSubInventoryRepository.save(subInventory);
    } catch (err) {
      console.log(err);
    }
  }
  async findAll(): Promise<SubIntventoriesCatering[]> {
    return await this.cateringShopSubInventoryRepository.find({
      relations: ['ingredient'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} subIntventoriesCatering`;
  }

  update(
    id: number,
    updateSubIntventoriesCateringDto: UpdateSubIntventoriesCateringDto,
  ) {
    return `This action updates a #${id} subIntventoriesCatering`;
  }

  remove(id: number) {
    return `This action removes a #${id} subIntventoriesCatering`;
  }
}
