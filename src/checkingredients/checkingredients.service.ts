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
    const checkingredientSave = await this.checkingredientRepository.save(
      checkingredient,
    );

    // Process each item in the list
    for (const itemDto of createCheckingredientDto.checkingredientitems) {
      try {
        // Check if the sub-inventory record already exists
        let subInventoryCatering =
          await this.cateringShopSubInventoryRepository.findOne({
            where: {
              ingredient: { ingredientId: itemDto.ingredientId },
            },
          });

        // Handle withdrawal and return actions
        if (itemDto.type === 'coffee') {
          console.log('Handling coffee sub-inventory for catering');

          const subInvenCoffee =
            await this.coffeeShopSubInventoryRepository.findOne({
              where: { ingredient: { ingredientId: itemDto.ingredientId } },
              relations: ['ingredient'],
            });

          if (!subInvenCoffee) {
            throw new Error(
              `Ingredient ID ${itemDto.ingredientId} not found in coffee sub-inventory.`,
            );
          }

          // If withdrawal, deduct stock from the main inventory
          if (createCheckingredientDto.actionType === 'withdrawal') {
            if (subInvenCoffee.quantity < itemDto.UsedQuantity) {
              throw new Error(
                `Not enough stock for Ingredient ID ${itemDto.ingredientId} in coffee sub-inventory.`,
              );
            }
            subInvenCoffee.quantity -= itemDto.UsedQuantity; // Deduct stock

            // If the sub-inventory already exists, update the quantity
            if (subInventoryCatering) {
              subInventoryCatering.quantity += itemDto.UsedQuantity;
            } else {
              // Create new record if it doesn't exist
              subInventoryCatering = new SubIntventoriesCatering();
              subInventoryCatering.ingredient = subInvenCoffee.ingredient;
              subInventoryCatering.quantity = itemDto.UsedQuantity;
              subInventoryCatering.type = 'coffee';
              subInventoryCatering.createdDate = new Date();
            }
          } else if (createCheckingredientDto.actionType === 'return') {
            if (itemDto.UsedQuantity > subInventoryCatering.quantity) {
              throw new Error(
                `Not enough stock for Ingredient ID ${itemDto.ingredientId} in catering sub-inventory.`,
              );
            } else {
              // For return, update the quantity without creating a new record
              subInvenCoffee.quantity += itemDto.UsedQuantity;

              // If the sub-inventory exists, update the quantity to reflect the return
              if (subInventoryCatering) {
                subInventoryCatering.quantity = 0;
              }
            }
          }

          subInventoryCatering.updatedDate = new Date();
          subInventoryCatering.checkingredient = checkingredientSave;

          // Save the updated coffee sub-inventory and catering sub-inventory
          await this.coffeeShopSubInventoryRepository.save(subInvenCoffee);
          await this.cateringShopSubInventoryRepository.save(
            subInventoryCatering,
          );
        }

        if (itemDto.type === 'rice') {
          console.log('Handling rice sub-inventory for catering');

          const subInvenRice =
            await this.riceShopSubInventoryRepository.findOne({
              where: { ingredient: { ingredientId: itemDto.ingredientId } },
              relations: ['ingredient'],
            });

          if (!subInvenRice) {
            throw new Error(
              `Ingredient ID ${itemDto.ingredientId} not found in rice sub-inventory.`,
            );
          }

          // If withdrawal, deduct stock from the main inventory
          if (createCheckingredientDto.actionType === 'withdrawal') {
            if (subInvenRice.quantity < itemDto.UsedQuantity) {
              throw new Error(
                `Not enough stock for Ingredient ID ${itemDto.ingredientId} in rice sub-inventory.`,
              );
            }
            subInvenRice.quantity -= itemDto.UsedQuantity; // Deduct stock

            // If the sub-inventory already exists, update the quantity
            if (subInventoryCatering) {
              subInventoryCatering.quantity += itemDto.UsedQuantity;
            } else {
              // Create new record if it doesn't exist
              subInventoryCatering = new SubIntventoriesCatering();
              subInventoryCatering.ingredient = subInvenRice.ingredient;
              subInventoryCatering.quantity = itemDto.UsedQuantity;
              subInventoryCatering.type = 'rice';
              subInventoryCatering.createdDate = new Date();
            }
          } else if (createCheckingredientDto.actionType === 'return') {
            if (itemDto.UsedQuantity > subInventoryCatering.quantity) {
              throw new Error(
                `Not enough stock for Ingredient ID ${itemDto.ingredientId} in catering sub-inventory.`,
              );
            } else {
              // For return, update the quantity without creating a new record
              subInvenRice.quantity += itemDto.UsedQuantity;

              // If the sub-inventory exists, update the quantity to reflect the return
              if (subInventoryCatering) {
                subInventoryCatering.quantity = 0;
              }
            }
          }

          subInventoryCatering.updatedDate = new Date();
          subInventoryCatering.checkingredient = checkingredientSave;

          // Save the updated rice sub-inventory and catering sub-inventory
          await this.riceShopSubInventoryRepository.save(subInvenRice);
          await this.cateringShopSubInventoryRepository.save(
            subInventoryCatering,
          );
        }
      } catch (error) {
        throw new Error('Failed to save SubInventory: ' + error.message);
      }
    }

    // Return checkingredient after all items have been processed
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
      (actionType === 'withdrawal' || actionType === 'return')
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
    return await this.checkingredientRepository.findOne({
      where: { CheckID: id },
      relations: [
        'checkingredientitem',
        'user',
        'checkingredientitem.ingredient',
      ],
    });
  }

  remove(id: number) {
    return `This action removes a #${id} checkingredient`;
  }
}
