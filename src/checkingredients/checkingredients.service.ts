import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCheckingredientDto } from './dto/create-checkingredient.dto';
import { SubInventoriesCoffee } from 'src/sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { SubInventoriesRice } from 'src/sub-inventories-rice/entities/sub-inventories-rice.entity';
import { SubIntventoriesCatering } from 'src/sub-intventories-catering/entities/sub-intventories-catering.entity';
import { log } from 'console';

@Injectable()
export class CheckingredientsService {
  constructor(
    @InjectRepository(Checkingredient)
    private checkingredientRepository: Repository<Checkingredient>,
    @InjectRepository(Checkingredientitem)
    private checkingredientitemRepository: Repository<Checkingredientitem>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SubInventoriesCoffee)
    private coffeeShopSubInventoryRepository: Repository<SubInventoriesCoffee>,
    @InjectRepository(SubInventoriesRice)
    private riceShopSubInventoryRepository: Repository<SubInventoriesRice>,
    @InjectRepository(SubIntventoriesCatering)
    private cateringShopSubInventoryRepository: Repository<SubIntventoriesCatering>,
  ) {}

  async create(createCheckingredientDto: CreateCheckingredientDto) {
    const user = await this.userRepository.findOneBy({
      userId: createCheckingredientDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checkingredient = new Checkingredient();
    checkingredient.user = user;
    checkingredient.date = createCheckingredientDto.date;
    checkingredient.shopType = createCheckingredientDto.shopType;
    checkingredient.checkDescription =
      createCheckingredientDto.checkDescription;
    checkingredient.actionType = createCheckingredientDto.actionType;

    for (const itemDto of createCheckingredientDto.checkingredientitems) {
      const ingredient = await this.ingredientRepository.findOneBy({
        ingredientId: itemDto.ingredientId,
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with ID ${itemDto.ingredientId} not found`,
        );
      }

      if (
        createCheckingredientDto.actionType === 'withdrawal' &&
        ingredient.ingredientQuantityInStock < itemDto.UsedQuantity
      ) {
        throw new Error(
          `Not enough stock for Ingredient ID ${itemDto.ingredientId}`,
        );
      }

      const checkingredientitem = new Checkingredientitem();
      checkingredientitem.ingredient = ingredient;
      checkingredientitem.UsedQuantity = itemDto.UsedQuantity;
      checkingredientitem.oldRemain = ingredient.ingredientQuantityInStock;

      // Update SubInventory
      try {
        let subInventory;

        if (createCheckingredientDto.shopType === 'rice') {
          subInventory = await this.riceShopSubInventoryRepository.findOne({
            where: { ingredient: { ingredientId: ingredient.ingredientId } },
          });

          if (
            subInventory &&
            createCheckingredientDto.actionType === 'withdrawal' &&
            subInventory.quantity > 0
          ) {
            throw new Error(
              `Cannot withdraw from rice shop sub-inventory because quantity > 0 for ingredient ID: ${ingredient.ingredientId}`,
            );
          }

          if (!subInventory) {
            subInventory = new SubInventoriesRice();
            subInventory.ingredient = ingredient;
            subInventory.quantity = itemDto.UsedQuantity;
            subInventory.createdDate = new Date();
            subInventory.updatedDate = new Date();
          } else {
            if (createCheckingredientDto.actionType === 'withdrawal') {
              subInventory.quantity += itemDto.UsedQuantity;
            } else if (createCheckingredientDto.actionType === 'return') {
              subInventory.quantity = 0;
            }
          }

          await this.riceShopSubInventoryRepository.save(subInventory);
        } else if (createCheckingredientDto.shopType === 'coffee') {
          subInventory = await this.coffeeShopSubInventoryRepository.findOne({
            where: { ingredient: { ingredientId: ingredient.ingredientId } },
          });

          if (
            subInventory &&
            createCheckingredientDto.actionType === 'withdrawal' &&
            subInventory.quantity > 0
          ) {
            throw new Error(
              `Cannot withdraw from coffee shop sub-inventory because quantity > 0 for ingredient ID: ${ingredient.ingredientId}`,
            );
          }

          if (!subInventory) {
            subInventory = new SubInventoriesCoffee();
            subInventory.ingredient = ingredient;
            subInventory.quantity = itemDto.UsedQuantity;
            subInventory.createdDate = new Date();
            subInventory.updatedDate = new Date();
          } else {
            if (createCheckingredientDto.actionType === 'withdrawal') {
              subInventory.quantity += itemDto.UsedQuantity;
            } else if (createCheckingredientDto.actionType === 'return') {
              subInventory.quantity = 0;
            }
          }

          await this.coffeeShopSubInventoryRepository.save(subInventory);
        }

        if (createCheckingredientDto.actionType === 'withdrawal') {
          ingredient.ingredientQuantityInStock -= itemDto.UsedQuantity;
        } else if (createCheckingredientDto.actionType === 'return') {
          ingredient.ingredientQuantityInStock += itemDto.UsedQuantity;
        }

        await this.ingredientRepository.save(ingredient);

        const savedCheckingredient = await this.checkingredientRepository.save(
          checkingredient,
        );

        checkingredientitem.checkingredient = savedCheckingredient;
        await this.checkingredientitemRepository.save(checkingredientitem);
      } catch (error) {
        throw new Error('Failed to save SubInventory: ' + error.message);
      }
    }

    return await this.checkingredientRepository.findOne({
      where: { CheckID: checkingredient.CheckID },
      relations: ['checkingredientitem'],
    });
  }

  async createForCatering(createCheckingredientDto: CreateCheckingredientDto) {
    const user = await this.userRepository.findOneBy({
      userId: createCheckingredientDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checkingredient = new Checkingredient();
    checkingredient.user = user;
    checkingredient.date = createCheckingredientDto.date;
    checkingredient.shopType = createCheckingredientDto.shopType;
    checkingredient.checkDescription =
      createCheckingredientDto.checkDescription;
    checkingredient.actionType = createCheckingredientDto.actionType;
    if (createCheckingredientDto.actionType === 'withdrawalHistory') {
      checkingredient.totalPrice = createCheckingredientDto.totalPrice;
    }
    const checkingredientSave = await this.checkingredientRepository.save(
      checkingredient,
    );

    // Process each item in the list
    for (const itemDto of createCheckingredientDto.checkingredientitems) {
      try {
        let subInventoryCatering =
          await this.cateringShopSubInventoryRepository.findOne({
            where: {
              ingredient: { ingredientId: itemDto.ingredientId },
            },
          });

        let subInventory, subInventoryType: string;

        if (itemDto.type === 'coffee') {
          console.log('Handling coffee sub-inventory for catering');
          subInventoryType = 'coffee';

          subInventory = await this.coffeeShopSubInventoryRepository.findOne({
            where: { ingredient: { ingredientId: itemDto.ingredientId } },
            relations: ['ingredient'],
          });

          if (!subInventory) {
            throw new Error(
              `Ingredient ID ${itemDto.ingredientId} not found in coffee sub-inventory.`,
            );
          }
        } else if (itemDto.type === 'rice') {
          console.log('Handling rice sub-inventory for catering');
          subInventoryType = 'rice';

          subInventory = await this.riceShopSubInventoryRepository.findOne({
            where: { ingredient: { ingredientId: itemDto.ingredientId } },
            relations: ['ingredient'],
          });

          if (!subInventory) {
            throw new Error(
              `Ingredient ID ${itemDto.ingredientId} not found in rice sub-inventory.`,
            );
          }
        } else {
          throw new Error(`Unknown item type: ${itemDto.type}`);
        }

        if (createCheckingredientDto.actionType === 'withdrawal') {
          if (subInventory.quantity < itemDto.UsedQuantity) {
            throw new Error(
              `Not enough stock for Ingredient ID ${itemDto.ingredientId} in ${subInventoryType} sub-inventory.`,
            );
          }

          subInventory.quantity -= itemDto.UsedQuantity;

          if (subInventoryCatering) {
            subInventoryCatering.quantity += itemDto.UsedQuantity;
          } else {
            subInventoryCatering = new SubIntventoriesCatering();
            subInventoryCatering.ingredient = subInventory.ingredient;
            subInventoryCatering.quantity = itemDto.UsedQuantity;
            subInventoryCatering.type = subInventoryType;
            subInventoryCatering.createdDate = new Date();
          }
        } else if (createCheckingredientDto.actionType === 'return') {
          subInventory.quantity += itemDto.UsedQuantity;

          if (subInventoryCatering) {
            subInventoryCatering.quantity = 0;
          }
        } else if (
          createCheckingredientDto.actionType === 'withdrawalHistory'
        ) {
          // Similar to withdrawal but without resetting to 0
          if (subInventory.quantity < itemDto.UsedQuantity) {
            throw new Error(
              `Not enough stock for Ingredient ID ${itemDto.ingredientId} in ${subInventoryType} sub-inventory.`,
            );
          }

          subInventory.quantity -= itemDto.UsedQuantity;

          if (subInventoryCatering) {
            subInventoryCatering.quantity -= itemDto.UsedQuantity;
            if (subInventoryCatering.quantity < 0) {
              throw new Error(
                `Insufficient stock in catering inventory for Ingredient ID ${itemDto.ingredientId}.`,
              );
            }
          } else {
            subInventoryCatering = new SubIntventoriesCatering();
            subInventoryCatering.ingredient = subInventory.ingredient;
            subInventoryCatering.quantity = -itemDto.UsedQuantity;
            if (subInventoryCatering.quantity < 0) {
              throw new Error(
                `Insufficient stock in catering inventory for Ingredient ID ${itemDto.ingredientId}.`,
              );
            }
            subInventoryCatering.type = subInventoryType;
            subInventoryCatering.createdDate = new Date();
          }
        }

        subInventoryCatering.updatedDate = new Date();
        subInventoryCatering.checkingredient = checkingredientSave;

        await this[subInventoryType + 'ShopSubInventoryRepository'].save(
          subInventory,
        );
        await this.cateringShopSubInventoryRepository.save(
          subInventoryCatering,
        );

        // Create and save checkingredientitem
        const checkingredientitem = new Checkingredientitem();
        checkingredientitem.ingredient = subInventory.ingredient;
        checkingredientitem.UsedQuantity = itemDto.UsedQuantity;
        checkingredientitem.oldRemain =
          subInventory.ingredient.ingredientQuantityInStock;
        checkingredientitem.checkingredient = checkingredientSave;
        checkingredientitem.type = subInventoryType;

        console.log('checkingredientitem', checkingredientitem);

        await this.checkingredientitemRepository.save(checkingredientitem);
      } catch (error) {
        throw new Error('Failed to save SubInventory: ' + error.message);
      }
    }

    return await this.checkingredientRepository.findOne({
      where: { CheckID: checkingredient.CheckID },
      relations: ['checkingredientitem'],
    });
  }

  async createWithoutInventory(
    createCheckingredientDto: CreateCheckingredientDto,
  ) {
    console.log(createCheckingredientDto);

    const user = await this.userRepository.findOneBy({
      userId: createCheckingredientDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checkingredient = new Checkingredient();
    checkingredient.user = user;
    checkingredient.date = createCheckingredientDto.date;
    checkingredient.shopType = createCheckingredientDto.shopType;
    checkingredient.checkDescription =
      createCheckingredientDto.checkDescription;
    checkingredient.actionType = createCheckingredientDto.actionType;

    // Process each checkingredientitem, focusing on withdrawal (issuing) only
    for (const itemDto of createCheckingredientDto.checkingredientitems) {
      const ingredient = await this.ingredientRepository.findOneBy({
        ingredientId: itemDto.ingredientId,
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with ID ${itemDto.ingredientId} not found`,
        );
      }

      // Handle only the 'issuing' (withdrawal) action
      if (createCheckingredientDto.actionType === 'issuing') {
        if (ingredient.ingredientQuantityInStock < itemDto.UsedQuantity) {
          throw new Error(
            `Not enough stock for Ingredient ID ${itemDto.ingredientId}`,
          );
        }

        // Here we only log the withdrawal for coffee and rice shops without updating stock directly
        if (
          createCheckingredientDto.shopType === 'coffee' ||
          createCheckingredientDto.shopType === 'rice'
        ) {
          console.log(
            `Issuing ${itemDto.UsedQuantity} of ingredient ID ${itemDto.ingredientId} for ${createCheckingredientDto.shopType} shop.`,
          );
        }

        // Save log of withdrawal without updating actual ingredient inventory
        const checkingredientitem = new Checkingredientitem();
        checkingredientitem.ingredient = ingredient;
        checkingredientitem.UsedQuantity = itemDto.UsedQuantity;
        checkingredientitem.oldRemain = ingredient.ingredientQuantityInStock;

        const savedCheckingredient = await this.checkingredientRepository.save(
          checkingredient,
        );

        checkingredientitem.checkingredient = savedCheckingredient;
        await this.checkingredientitemRepository.save(checkingredientitem);
      }
    }

    // Return the created check ingredient record with its items
    return await this.checkingredientRepository.findOne({
      where: { CheckID: checkingredient.CheckID },
      relations: ['checkingredientitem'],
    });
  }

  async findAll(actionType?: string): Promise<Checkingredient[]> {
    const query = this.checkingredientRepository
      .createQueryBuilder('checkingredient')
      .leftJoinAndSelect(
        'checkingredient.checkingredientitem',
        'checkingredientitem',
      )
      .leftJoinAndSelect('checkingredient.user', 'user')
      .leftJoinAndSelect('checkingredientitem.ingredient', 'ingredient');

    if (actionType) {
      query.andWhere('checkingredient.actionType = :actionType', {
        actionType,
      });
    }

    // Order by the latest checkingredientitem creation date for each checkingredient
    query.orderBy('checkingredient.createdDate', 'DESC');

    return await query.getMany();
  }

  async findByShop(
    actionType?: string,
    shopType?: string,
  ): Promise<Checkingredient[]> {
    const query = this.checkingredientRepository
      .createQueryBuilder('checkingredient')
      .leftJoinAndSelect(
        'checkingredient.checkingredientitem',
        'checkingredientitem',
      )
      .leftJoinAndSelect('checkingredient.user', 'user')
      .leftJoinAndSelect('checkingredientitem.ingredient', 'ingredient');

    if (
      actionType &&
      (actionType === 'withdrawal' ||
        actionType === 'return' ||
        actionType === 'withdrawalHistory')
    ) {
      query.andWhere('checkingredient.actionType = :actionType', {
        actionType,
      });
    }

    if (shopType) {
      query.andWhere('checkingredient.shopType = :shopType', { shopType });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<Checkingredient | undefined> {
    const checkingredient = await this.checkingredientRepository.findOne({
      where: { CheckID: id },
      relations: [
        'checkingredientitem',
        'user',
        'checkingredientitem.ingredient',
        'checkingredientitem.ingredient.importingredientitem',
      ],
    });

    if (!checkingredient) {
      throw new NotFoundException('Checkingredient not found');
    }

    // Assign the lastPrice for each ingredient item based on the latest import
    checkingredient.checkingredientitem.forEach((item) => {
      const importItems = item.ingredient.importingredientitem;
      if (importItems && importItems.length > 0) {
        // Get the latest import item by sorting by createdDate in descending order
        const latestImportItem = importItems.sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime(),
        )[0];
        item.lastPrice = latestImportItem
          ? latestImportItem.unitPrice / latestImportItem.Quantity
          : 0;
      } else {
        item.lastPrice = 0; // If no import items, set lastPrice to null
      }
    });
    console.log(checkingredient);

    return checkingredient;
  }

  remove(id: number) {
    return `This action removes a #${id} checkingredient`;
  }
}
